import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDatabase from "./src/database/database.js";
import router from "./src/routes/index.js";
import swaggerRouter from "./src/routes/swagger.route.cjs";

const app = express();

connectDatabase();
app.use(cors());
app.use(express.json());
app.use(router);
app.use("/doc", swaggerRouter);

export default app;