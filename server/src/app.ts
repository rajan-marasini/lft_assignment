import "@/docs/zod-openapi";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import swaggerRoute from "@/docs/swagger.route";
import { CorsMiddleware } from "@/middleware/cors.middleware";
import { handleError } from "@/middleware/error.handler";
import { authRoute, eventRoute, tagRoute } from "@/routes";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(morgan("dev"));
app.use(CorsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Event Planning APIs is running",
    docs: "/docs",
  });
});

app.use("/docs", swaggerRoute);
app.use("/api/auth", authRoute);
app.use("/api/events", eventRoute);
app.use("/api/tags", tagRoute);

app.use(handleError);

export default app;
