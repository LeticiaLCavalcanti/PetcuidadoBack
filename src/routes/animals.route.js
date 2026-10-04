import animalsController from "../controllers/animals.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

import { Router } from "express";

const animalsRouter = Router();

animalsRouter.use(authMiddleware);
animalsRouter.post("/create", animalsController.postAnimalsController);
animalsRouter.get('/list', animalsController.getAnimalsController);
animalsRouter.get('/findById/:id', animalsController.findAnimalsByIdController);

animalsRouter.patch('/update/:id', animalsController.updateAnimalsController);
animalsRouter.delete('/delete/:id', animalsController.deleteAnimalsController);


export default animalsRouter;