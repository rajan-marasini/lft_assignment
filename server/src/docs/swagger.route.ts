import express from "express";
import swaggerUi from "swagger-ui-express";
import { generateOpenApiDocument } from "./openapi.generator";

const router = express.Router();

const openApiDocument = generateOpenApiDocument();

router.get("/json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(openApiDocument);
});

router.use("/", swaggerUi.serve, swaggerUi.setup(openApiDocument));

export default router;
