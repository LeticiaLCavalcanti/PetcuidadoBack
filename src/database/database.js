import mongoose from "mongoose";

const connectDatabase = async () => {
  console.log("Aguarde a conexão ao banco de dados...");

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL não foi definida no .env (copie o .env.example e preencha com a string do Atlas)"
    );
  }

  if (process.env.DATABASE_URL.includes("<")) {
    throw new Error(
      "DATABASE_URL ainda contém placeholders (<usuario>/<senha>/<cluster>). Preencha com a string real do Atlas."
    );
  }

  await mongoose.connect(process.env.DATABASE_URL, {
    serverSelectionTimeoutMS: 15000,
    dbName: process.env.DATABASE_NAME || "PetCuidado",
  });

  console.log(`MongoDB conectado com sucesso (database: ${mongoose.connection.name})`);
};

export default connectDatabase;
