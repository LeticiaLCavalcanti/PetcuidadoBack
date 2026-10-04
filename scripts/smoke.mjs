/**
 * Smoke test das rotas principais.
 *
 *   npm run smoke            -> usa a DATABASE_URL do .env (Atlas)
 *   npm run smoke:memory     -> sobe um MongoDB em memória (não precisa do Atlas)
 */
import "dotenv/config";
import mongoose from "mongoose";

const useMemory = process.env.SMOKE_MEMORY === "1";
let memoryServer;

if (useMemory) {
  // Não é dependência do projeto de propósito: instalá-la quebra o build do
  // Render, que roda `yarn` e traz devDependencies junto.
  // Instale sob demanda com: npm i --no-save mongodb-memory-server
  let MongoMemoryServer;
  try {
    ({ MongoMemoryServer } = await import("mongodb-memory-server"));
  } catch {
    console.error(
      "mongodb-memory-server não está instalado.\n" +
        "  Instale sob demanda:  npm i --no-save mongodb-memory-server\n" +
        "  Ou rode contra o Atlas:  npm run smoke"
    );
    process.exit(1);
  }
  memoryServer = await MongoMemoryServer.create();
  process.env.DATABASE_URL = memoryServer.getUri();
  process.env.SECRET ||= "smoke-test-secret";
}

const { default: app } = await import("../app.js");
const { default: connectDatabase } = await import("../src/database/database.js");

await connectDatabase();

const server = app.listen(0);
await new Promise((resolve) => server.once("listening", resolve));
const baseURL = `http://127.0.0.1:${server.address().port}`;

let failures = 0;

async function step(label, expectedStatus, path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${baseURL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  const ok = response.status === expectedStatus;
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FALHOU"}  ${String(response.status).padEnd(3)} (esperado ${expectedStatus})  ${method} ${path}  ${label}`
  );
  if (!ok) console.log("        resposta:", text.slice(0, 300));

  return data;
}

const suffix = Date.now();

function makeCredentials(tag) {
  return {
    name: `Smoke ${tag}`,
    username: `smoke_${tag}_${suffix}`,
    email: `smoke_${tag}_${suffix}@petcuidado.test`,
    password: "senha12345",
  };
}

const credentials = makeCredentials("a");
const otherCredentials = makeCredentials("b");

console.log(`\nRodando smoke test contra ${useMemory ? "MongoDB em memória" : "MongoDB Atlas"}\n`);

await step("health check", 200, "/health");

await step("cria usuário", 201, "/user/create", { method: "POST", body: credentials });

await step("recusa usuário duplicado", 400, "/user/create", { method: "POST", body: credentials });

const login = await step("login", 200, "/auth/login", {
  method: "POST",
  body: { email: credentials.email, password: credentials.password },
});

await step("recusa senha errada", 401, "/auth/login", {
  method: "POST",
  body: { email: credentials.email, password: "senha-errada" },
});

const token = login?.token;
if (!token) {
  console.log("FALHOU  login não retornou { token } — abortando os testes autenticados");
  failures++;
} else {
  console.log(`        token recebido (${token.slice(0, 20)}...)\n`);

  await step("bloqueia animal sem token", 401, "/animals/create", {
    method: "POST",
    body: { name: "x", birth: "2020", breed: "y" },
  });

  const emptyList = await step("lista animais vazia devolve []", 200, "/animals/list", { token });
  if (!Array.isArray(emptyList) || emptyList.length !== 0) {
    console.log("        esperava [] para usuário sem pets, veio:", JSON.stringify(emptyList).slice(0, 120));
    failures++;
  }

  const animal = await step("cria animal", 201, "/animals/create", {
    method: "POST",
    token,
    body: {
      name: "Mel",
      birth: "2021-03-15",
      breed: "Golden Retriever",
      color: "Dourado",
      weight: 28,
      chipNumber: `chip-${suffix}`,
      photo: "https://exemplo.com/mel.jpg",
    },
  });

  if (animal?.user) {
    console.log("        animal vinculado ao dono (user:", String(animal.user).slice(0, 8) + "...)");
  } else {
    console.log("FALHOU  animal criado sem o campo `user`");
    failures++;
  }

  if (animal?.birth?.startsWith("2021-03-15")) {
    console.log("        birth voltou como data ISO:", animal.birth);
  } else {
    console.log("FALHOU  birth não voltou como Date:", JSON.stringify(animal?.birth));
    failures++;
  }

  if (animal?.weight === 28) {
    console.log("        weight voltou como número:", animal.weight);
  } else {
    console.log("FALHOU  weight não voltou como número:", JSON.stringify(animal?.weight));
    failures++;
  }

  await step("recusa animal sem campos obrigatórios", 400, "/animals/create", {
    method: "POST",
    token,
    body: { name: "Sem raça" },
  });

  await step("recusa data fora do formato ISO", 400, "/animals/create", {
    method: "POST",
    token,
    body: { name: "Rex", birth: "15/03/2021", breed: "SRD" },
  });

  await step("recusa data inexistente (31/02)", 400, "/animals/create", {
    method: "POST",
    token,
    body: { name: "Rex", birth: "2021-02-31", breed: "SRD" },
  });

  await step("recusa peso com unidade colada", 400, "/animals/create", {
    method: "POST",
    token,
    body: { name: "Rex", birth: "2021-03-15", breed: "SRD", weight: "28kg" },
  });

  await step("lista animais", 200, "/animals/list", { token });
  await step("busca animal por id", 200, `/animals/findById/${animal?._id}`, { token });

  // ---- vínculo vacina -> animal ----
  await step("recusa vacina sem animal", 400, "/vaccines/create", {
    method: "POST",
    token,
    body: { name: "Sem animal", date: "2025-06-10" },
  });

  const vaccine = await step("cria vacina vinculada ao animal", 201, "/vaccines/create", {
    method: "POST",
    token,
    body: {
      animal: animal?._id,
      name: "Antirrábica",
      date: "2025-06-10",
      description: "Dose anual",
      photo: "https://exemplo.com/vacina.jpg",
    },
  });

  if (String(vaccine?.animal) !== String(animal?._id)) {
    console.log("FALHOU  vacina não ficou vinculada ao animal");
    failures++;
  }

  await step("recusa vacina com data fora do formato", 400, "/vaccines/create", {
    method: "POST",
    token,
    body: { animal: animal?._id, name: "X", date: "10/06/2025" },
  });

  await step("lista vacinas do usuário", 200, "/vaccines/list", { token });

  const byAnimal = await step("lista vacinas filtrando por animal", 200, `/vaccines/list?animal=${animal?._id}`, { token });
  if (!Array.isArray(byAnimal) || byAnimal.length !== 1) {
    console.log("        esperava 1 vacina para o pet, veio:", JSON.stringify(byAnimal).slice(0, 120));
    failures++;
  }

  await step("lista usuários", 200, "/user/", { token });

  // ---- isolamento entre usuários ----
  console.log("\n  -- isolamento entre usuários --");
  await step("cria segundo usuário", 201, "/user/create", { method: "POST", body: otherCredentials });
  const otherLogin = await step("login do segundo usuário", 200, "/auth/login", {
    method: "POST",
    body: { email: otherCredentials.email, password: otherCredentials.password },
  });
  const otherToken = otherLogin?.token;

  const otherList = await step("segundo usuário não vê pets alheios", 200, "/animals/list", { token: otherToken });
  if (!Array.isArray(otherList) || otherList.length !== 0) {
    console.log("        VAZAMENTO: veio", JSON.stringify(otherList).slice(0, 200));
    failures++;
  }

  const otherVaccines = await step("segundo usuário não vê vacinas alheias", 200, "/vaccines/list", { token: otherToken });
  if (!Array.isArray(otherVaccines) || otherVaccines.length !== 0) {
    console.log("        VAZAMENTO: veio", JSON.stringify(otherVaccines).slice(0, 200));
    failures++;
  }

  await step("bloqueia ler pet alheio", 404, `/animals/findById/${animal?._id}`, { token: otherToken });
  await step("bloqueia filtrar vacinas por pet alheio", 404, `/vaccines/list?animal=${animal?._id}`, { token: otherToken });
  await step("bloqueia criar vacina em pet alheio", 404, "/vaccines/create", {
    method: "POST",
    token: otherToken,
    body: { animal: animal?._id, name: "Invasora", date: "2025-01-01" },
  });
  await step("bloqueia editar pet alheio", 404, `/animals/update/${animal?._id}`, {
    method: "PATCH",
    token: otherToken,
    body: { name: "Sequestrado" },
  });
  await step("bloqueia excluir pet alheio", 404, `/animals/delete/${animal?._id}`, {
    method: "DELETE",
    token: otherToken,
  });
  await step("bloqueia ler vacina alheia", 404, `/vaccines/findById/${vaccine?._id}`, { token: otherToken });
  await step("bloqueia excluir vacina alheia", 404, `/vaccines/delete/${vaccine?._id}`, {
    method: "DELETE",
    token: otherToken,
  });

  // ---- cascata ----
  console.log("\n  -- exclusão em cascata --");
  if (animal?._id) await step("remove animal de teste", 200, `/animals/delete/${animal._id}`, { method: "DELETE", token });

  const orphans = await step("vacinas do pet somem junto", 200, "/vaccines/list", { token });
  if (!Array.isArray(orphans) || orphans.length !== 0) {
    console.log("        esperava [] após excluir o pet, veio:", JSON.stringify(orphans).slice(0, 200));
    failures++;
  }
}

await mongoose.connection.collection("users").deleteMany({
  email: { $in: [credentials.email, otherCredentials.email] },
});

await mongoose.disconnect();
server.close();
if (memoryServer) await memoryServer.stop();

console.log(`\n${failures === 0 ? "Todos os passos passaram." : `${failures} passo(s) falharam.`}\n`);
process.exit(failures === 0 ? 0 : 1);
