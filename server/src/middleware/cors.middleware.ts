import cors from "cors";
import { type RequestHandler } from "express";
import { corsOptions } from "../config/cors";

export const CorsMiddleware: RequestHandler = cors(corsOptions);
