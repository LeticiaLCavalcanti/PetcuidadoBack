import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import router from "./src/routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  const states = ["desconectado", "conectado", "conectando", "desconectando"];
  return res.status(200).json({
    status: "ok",
    database: states[mongoose.connection.readyState] ?? "desconhecido",
    databaseName: mongoose.connection.name ?? null,
  });
});

app.use(router);

app.use((req, res) => {
  return res.status(404).json({ message: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
});

app.use((error, req, res, next) => {
  console.error("Erro não tratado:", error);
  return res.status(500).json({ message: error.message || "Erro interno do servidor" });
});

export default app;
