import animalsController from "../controllers/animals.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { validId } from "../middlewares/global.middleware.js";

import { Router } from "express";

const animalsRouter = Router();

animalsRouter.use(authMiddleware);
animalsRouter.post("/create", animalsController.postAnimalsController);
animalsRouter.get('/list', animalsController.getAnimalsController);

// animalsRouter.use(validId);
animalsRouter.patch('/update/:id', animalsController.updateAnimalsController);
animalsRouter.delete('/delete/:id', animalsController.deleteAnimalsController);


export default animalsRouter;