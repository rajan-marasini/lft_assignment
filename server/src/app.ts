import express from "express";
import morgan from "morgan";

import { CorsMiddleware } from "@/middleware/cors.middleware";
import { handleError } from "@/middleware/error.handler";
import { authRoute } from "@/routes";

const app = express();

app.use(morgan("dev"));
app.use(CorsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.status(200).send("Server is running");
});

app.use("/api/auth", authRoute);

app.use(handleError);

export default app;
