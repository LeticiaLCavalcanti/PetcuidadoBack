/**
 * Migração da base criada antes de (a) vincular dono -> pet -> vacina e
 * (b) trocar datas/peso de string para os tipos reais.
 *
 *   npm run migrate                                  # só relata (dry-run)
 *   node scripts/migrate.mjs --apply                 # converte os tipos
 *   node scripts/migrate.mjs --apply --owner a@b.com # converte e adota os órfãos
 *   node scripts/migrate.mjs --apply --delete        # converte e apaga os órfãos
 *
 * Sem `--owner` nem `--delete`, os órfãos são apenas relatados: eles não
 * aparecem em nenhuma listagem enquanto não tiverem dono.
 *
 * Lê e escreve pelo driver do Mongo, não pelos models, porque os documentos
 * antigos não passam pelo cast do schema novo.
 */
import "dotenv/config";
import mongoose from "mongoose";

import connectDatabase from "../src/database/database.js";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};

const ownerEmail = flag("--owner");
const animalIdFlag = flag("--animal");
const shouldDelete = args.includes("--delete");
const apply = args.includes("--apply");

if (ownerEmail && shouldDelete) {
  console.error("Use --owner ou --delete, não os dois.");
  process.exit(1);
}

const ISO = /^(\d{4})-(\d{2})-(\d{2})/;
const BR = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/** Aceita os formatos que circularam quando o campo era string livre. */
function toDate(value) {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value !== "string") return null;

  const iso = ISO.exec(value.trim());
  if (iso) return new Date(Date.UTC(+iso[1], +iso[2] - 1, +iso[3]));

  const br = BR.exec(value.trim());
  if (br) return new Date(Date.UTC(+br[3], +br[2] - 1, +br[1]));

  return null;
}

/** "28kg", "7.5", " 3 " -> número. */
function toWeight(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  const parsed = Number.parseFloat(value.replace(",", ".").replace(/[^\d.]/g, ""));

  return Number.isFinite(parsed) ? parsed : null;
}

await connectDatabase();

const db = mongoose.connection;
const animals = db.collection("animals");
const vaccines = db.collection("vaccines");
const users = db.collection("users");

const plan = { dates: [], weights: [], unparsable: [], orphanAnimals: [], orphanVaccines: [] };

for (const animal of await animals.find({}).toArray()) {
  if (typeof animal.birth === "string") {
    const date = toDate(animal.birth);
    if (date) plan.dates.push({ col: animals, _id: animal._id, field: "birth", from: animal.birth, to: date });
    else plan.unparsable.push(`animal ${animal.name} (${animal._id}): birth = ${JSON.stringify(animal.birth)}`);
  }

  if (typeof animal.weight === "string" && animal.weight !== "") {
    const weight = toWeight(animal.weight);
    if (weight !== null) plan.weights.push({ _id: animal._id, from: animal.weight, to: weight });
    else plan.unparsable.push(`animal ${animal.name} (${animal._id}): weight = ${JSON.stringify(animal.weight)}`);
  }

  if (!animal.user) plan.orphanAnimals.push(animal);
}

for (const vaccine of await vaccines.find({}).toArray()) {
  if (typeof vaccine.date === "string") {
    const date = toDate(vaccine.date);
    if (date) plan.dates.push({ col: vaccines, _id: vaccine._id, field: "date", from: vaccine.date, to: date });
    else plan.unparsable.push(`vacina ${vaccine.name} (${vaccine._id}): date = ${JSON.stringify(vaccine.date)}`);
  }

  if (!vaccine.animal) plan.orphanVaccines.push(vaccine);
}

const iso = (d) => d.toISOString().slice(0, 10);

console.log(`\nDatas em string a converter:  ${plan.dates.length}`);
plan.dates.forEach((c) => console.log(`  - ${c.field}: ${JSON.stringify(c.from)} -> ${iso(c.to)}`));

console.log(`Pesos em string a converter:  ${plan.weights.length}`);
plan.weights.forEach((c) => console.log(`  - weight: ${JSON.stringify(c.from)} -> ${c.to}`));

console.log(`Animais sem dono:             ${plan.orphanAnimals.length}`);
plan.orphanAnimals.forEach((a) => console.log(`  - ${a.name} (${a._id})`));

console.log(`Vacinas sem pet:              ${plan.orphanVaccines.length}`);
plan.orphanVaccines.forEach((v) => console.log(`  - ${v.name} (${v._id})`));

if (plan.unparsable.length > 0) {
  console.log(`\nNão consegui interpretar (precisam de correção manual): ${plan.unparsable.length}`);
  plan.unparsable.forEach((m) => console.log(`  ! ${m}`));
}

const nothingToDo =
  plan.dates.length === 0 &&
  plan.weights.length === 0 &&
  plan.orphanAnimals.length === 0 &&
  plan.orphanVaccines.length === 0;

if (nothingToDo) {
  console.log(
    plan.unparsable.length > 0
      ? "\nNada a migrar automaticamente — mas os registros acima continuam com" +
          "\nvalor inválido e não vão aparecer direito no app até serem corrigidos.\n"
      : "\nNada a migrar.\n"
  );
  await mongoose.disconnect();
  process.exit(plan.unparsable.length > 0 ? 1 : 0);
}

if (!apply) {
  console.log(
    "\nDry-run: nada foi alterado. Rode de novo com --apply." +
      "\n  Adotar os órfãos:  --apply --owner <email>" +
      "\n  Apagar os órfãos:  --apply --delete\n"
  );
  await mongoose.disconnect();
  process.exit(0);
}

for (const change of plan.dates) {
  await change.col.updateOne({ _id: change._id }, { $set: { [change.field]: change.to } });
}
for (const change of plan.weights) {
  await animals.updateOne({ _id: change._id }, { $set: { weight: change.to } });
}
console.log(`\nConvertidos: ${plan.dates.length} data(s), ${plan.weights.length} peso(s).`);

if (shouldDelete) {
  const a = await animals.deleteMany({ _id: { $in: plan.orphanAnimals.map((x) => x._id) } });
  const v = await vaccines.deleteMany({ _id: { $in: plan.orphanVaccines.map((x) => x._id) } });
  console.log(`Removidos: ${a.deletedCount} animal(is), ${v.deletedCount} vacina(s).\n`);
} else if (ownerEmail) {
  const owner = await users.findOne({ email: ownerEmail.toLowerCase() });

  if (!owner) {
    console.error(`\nUsuário não encontrado: ${ownerEmail}\n`);
    await mongoose.disconnect();
    process.exit(1);
  }

  if (plan.orphanAnimals.length > 0) {
    await animals.updateMany(
      { _id: { $in: plan.orphanAnimals.map((x) => x._id) } },
      { $set: { user: owner._id } }
    );
    console.log(`${plan.orphanAnimals.length} animal(is) agora são de ${owner.email}.`);
  }

  if (plan.orphanVaccines.length > 0) {
    // Sem vínculo original, as vacinas precisam de um pet de destino.
    const target = animalIdFlag
      ? await animals.findOne({ _id: new mongoose.Types.ObjectId(animalIdFlag), user: owner._id })
      : await animals.findOne({ user: owner._id });

    if (!target) {
      console.error(
        "\nNenhum animal de destino para as vacinas órfãs." +
          "\nCadastre um pet para esse usuário, ou informe --animal <id>.\n"
      );
      await mongoose.disconnect();
      process.exit(1);
    }

    await vaccines.updateMany(
      { _id: { $in: plan.orphanVaccines.map((x) => x._id) } },
      { $set: { animal: target._id } }
    );
    console.log(`${plan.orphanVaccines.length} vacina(s) vinculadas a ${target.name} (${target._id}).`);
  }
  console.log("");
} else {
  console.log("Órfãos mantidos como estão (use --owner ou --delete para tratá-los).\n");
}

await mongoose.disconnect();
