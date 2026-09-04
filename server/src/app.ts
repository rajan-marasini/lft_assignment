import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";

import { CorsMiddleware } from "@/middleware/cors.middleware";
import { handleError } from "@/middleware/error.handler";
import { authRoute } from "@/routes";
import helmet from "helmet";

const app = express();

app.use(morgan("dev"));
app.use(CorsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet);

app.get("/", (_req, res) => {
  res.status(200).send("Server is running");
});

app.use("/api/auth", authRoute);

app.use(handleError);

export default app;
