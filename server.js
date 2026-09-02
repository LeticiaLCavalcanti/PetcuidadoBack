import "dotenv/config";
import app from "./app.js";
import connectDatabase from "./src/database/database.js";

const port = Number(process.env.PORT) || 3001;

if (!process.env.SECRET) {
  console.error("SECRET não foi definida no .env — a geração/validação de JWT não vai funcionar.");
  process.exit(1);
}

try {
  await connectDatabase();
} catch (error) {
  console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
  process.exit(1);
}

const server = app.listen(port, () =>
  console.log(`O servidor está rodando na porta: ${port}`)
);

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `A porta ${port} já está em uso. Finalize a instância antiga (lsof -nP -iTCP:${port} -sTCP:LISTEN, depois kill <PID>) ou suba com outra porta: PORT=3002 npm run dev`
    );
    process.exit(1);
  }
  throw error;
});
