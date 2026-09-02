import { Router } from "express";
import animalsRouter from "./animals.route.js";
import userRouter from "./user.route.js";
import vaccinesRouter from "./vaccines.route.js";
import authRouter from "./auth.route.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/animals", animalsRouter);
router.use("/user", userRouter);
router.use("/vaccines", vaccinesRouter);

export default router;