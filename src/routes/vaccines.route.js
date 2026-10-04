import vaccinesController from "../controllers/vaccines.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

import { Router } from "express";

const vaccinesRouter = Router();

vaccinesRouter.use(authMiddleware);
vaccinesRouter.post("/create", vaccinesController.postVaccinesController);
vaccinesRouter.get('/list', vaccinesController.getVaccinesController);
vaccinesRouter.get('/findById/:id', vaccinesController.findVaccinesByIdController);

vaccinesRouter.patch('/update/:id', vaccinesController.updateVaccinesController);
vaccinesRouter.delete('/delete/:id', vaccinesController.deleteVaccinesController);


export default vaccinesRouter;