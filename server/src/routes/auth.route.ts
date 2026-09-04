import * as authController from "@/controller/auth.controller";
import express from "express";

const router = express.Router();

router.post("/register", authController.RegisterUser);

export default router;
