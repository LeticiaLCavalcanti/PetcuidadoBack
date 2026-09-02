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
  const { MongoMemoryServer } = await import("mongodb-memory-server");
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
const credentials = {
  name: "Smoke Test",
  username: `smoke_${suffix}`,
  email: `smoke_${suffix}@petcuidado.test`,
  password: "senha12345",
};

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

  const animal = await step("cria animal", 201, "/animals/create", {
    method: "POST",
    token,
    body: {
      name: "Mel",
      birth: "2021-03-15",
      breed: "Golden Retriever",
      color: "Dourado",
      weight: "28kg",
      chipNumber: `chip-${suffix}`,
      photo: "https://exemplo.com/mel.jpg",
    },
  });

  await step("recusa animal sem campos obrigatórios", 400, "/animals/create", {
    method: "POST",
    token,
    body: { name: "Sem raça" },
  });

  await step("lista animais", 200, "/animals/list", { token });

  const vaccine = await step("cria vacina", 201, "/vaccines/create", {
    method: "POST",
    token,
    body: {
      name: "Antirrábica",
      date: "2025-06-10",
      description: "Dose anual",
      photo: "https://exemplo.com/vacina.jpg",
    },
  });

  await step("lista vacinas", 200, "/vaccines/list", { token });

  await step("lista usuários", 200, "/user/", { token });

  if (animal?._id) await step("remove animal de teste", 200, `/animals/delete/${animal._id}`, { method: "DELETE", token });
  if (vaccine?._id) await step("remove vacina de teste", 200, `/vaccines/delete/${vaccine._id}`, { method: "DELETE", token });
}

await mongoose.connection.collection("users").deleteOne({ email: credentials.email });

await mongoose.disconnect();
server.close();
if (memoryServer) await memoryServer.stop();

console.log(`\n${failures === 0 ? "Todos os passos passaram." : `${failures} passo(s) falharam.`}\n`);
process.exit(failures === 0 ? 0 : 1);
