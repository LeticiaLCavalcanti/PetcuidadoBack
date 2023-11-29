import mongoose from "mongoose";

const  connectDatabase = () => {
    console.log('Aguarde a conexão ao banco de dados')

    mongoose.connect(process.env.DATABASE_URL,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log("MongoDB Atlas foi conectado com sucesso"))
    .catch((error) => console.log(`Erro ao conectar ao MongoDB Atlas: ${error}`))
}

export default connectDatabase; 