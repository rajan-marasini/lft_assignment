import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./openapi.registry";

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Event Planning API Documentation",
      description:
        "RESTful API documentation for the Event Planning full-stack application. Automatically generated from Zod schemas and OpenAPIRegistry.",
    },
    servers: [
      {
        url: "/",
        description: "Current Server Instance",
      },
    ],
  });
}
