import "./zod-openapi";

import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from "@/schemas/auth.schema";
import {
  createEventSchema,
  getEventsQuerySchema,
  updateEventSchema,
} from "@/schemas/event.schema";
import { createTagSchema, updateTagSchema } from "@/schemas/tag.schema";

export const registry = new OpenAPIRegistry();

// Register Security Schemes
const bearerAuth = registry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "JWT access token header: Bearer <token>",
});

const cookieAuth = registry.registerComponent("securitySchemes", "CookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: "refreshToken",
  description: "Refresh token stored in HTTP-only cookie",
});

// --- Common Schemas ---
const ErrorResponseSchema = registry.register(
  "ErrorResponse",
  z.object({
    success: z.boolean().default(false),
    message: z.string(),
    errors: z.array(z.unknown()).optional(),
  }),
);

const UserSchema = registry.register(
  "User",
  z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
    is_verified: z.boolean().default(false),
    created_at: z.string(),
    updated_at: z.string(),
  }),
);

const TagSchema = registry.register(
  "Tag",
  z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
);

const EventSchema = registry.register(
  "Event",
  z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string(),
    starts_at: z.string(),
    location: z.string(),
    visibility: z.enum(["public", "private"]),
    created_at: z.string(),
    updated_at: z.string(),
    creator: z.object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email(),
    }),
    tags: z.array(TagSchema),
  }),
);

// --- Auth Routes ---
registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  summary: "Register a new user",
  tags: ["Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerSchema.openapi({ title: "RegisterInput" }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "User registered successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({ user: UserSchema }),
          }),
        },
      },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    409: {
      description: "Email already registered",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  summary: "Login user",
  tags: ["Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema.openapi({ title: "LoginInput" }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              user: UserSchema,
              accessToken: z.string(),
            }),
          }),
        },
      },
    },
    401: {
      description: "Invalid credentials",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    403: {
      description: "Email not verified",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/auth/verify-email",
  summary: "Verify user email address using token",
  tags: ["Authentication"],
  request: {
    query: z.object({
      token: z.string().openapi({ description: "Email verification token" }),
    }),
  },
  responses: {
    200: {
      description: "Email verified successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    400: {
      description: "Invalid or expired token",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/resend-verification",
  summary: "Resend email verification link",
  tags: ["Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            email: z.string().email(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Verification email sent if account exists",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/refresh",
  summary: "Refresh access token",
  tags: ["Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: refreshTokenSchema.openapi({ title: "RefreshTokenInput" }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Access token refreshed successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              accessToken: z.string(),
            }),
          }),
        },
      },
    },
    401: {
      description: "Invalid or expired refresh token",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/logout",
  summary: "Logout user",
  tags: ["Authentication"],
  security: [{ [bearerAuth.name]: [] }, { [cookieAuth.name]: [] }],
  responses: {
    200: {
      description: "Logged out successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/auth/me",
  summary: "Get current authenticated user profile",
  tags: ["Authentication"],
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: {
      description: "Current user profile fetched",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.object({ user: UserSchema }),
          }),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

// --- Event Routes ---
registry.registerPath({
  method: "post",
  path: "/api/events",
  summary: "Create a new event",
  tags: ["Events"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createEventSchema.openapi({ title: "CreateEventInput" }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Event created successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({ event: EventSchema }),
          }),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/events",
  summary: "Get list of events with filtering, search, and pagination",
  tags: ["Events"],
  request: {
    query: getEventsQuerySchema.openapi({ title: "GetEventsQuery" }),
  },
  responses: {
    200: {
      description: "Events retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.object({
              events: z.array(EventSchema),
              pagination: z.object({
                page: z.number(),
                limit: z.number(),
                totalItems: z.number(),
                totalPages: z.number(),
              }),
            }),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/events/{eventId}",
  summary: "Get event details by ID",
  tags: ["Events"],
  request: {
    params: z.object({
      eventId: z.string().uuid().openapi({ description: "Event ID" }),
    }),
  },
  responses: {
    200: {
      description: "Event details retrieved",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.object({ event: EventSchema }),
          }),
        },
      },
    },
    404: {
      description: "Event not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/events/{eventId}",
  summary: "Update event details (Creator only)",
  tags: ["Events"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      eventId: z.string().uuid().openapi({ description: "Event ID" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: updateEventSchema.openapi({ title: "UpdateEventInput" }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Event updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({ event: EventSchema }),
          }),
        },
      },
    },
    403: {
      description: "Forbidden - Not event creator",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    404: {
      description: "Event not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/events/{eventId}",
  summary: "Delete event (Creator only)",
  tags: ["Events"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      eventId: z.string().uuid().openapi({ description: "Event ID" }),
    }),
  },
  responses: {
    200: {
      description: "Event deleted successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    403: {
      description: "Forbidden - Not event creator",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    404: {
      description: "Event not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

// --- Tag Routes ---
registry.registerPath({
  method: "get",
  path: "/api/tags",
  summary: "Get all tags with usage count",
  tags: ["Tags"],
  responses: {
    200: {
      description: "Tags fetched successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.object({
              tags: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  event_count: z.number(),
                }),
              ),
            }),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/tags",
  summary: "Create a new tag",
  tags: ["Tags"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createTagSchema.openapi({ title: "CreateTagInput" }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Tag created successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({ tag: TagSchema }),
          }),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/tags/{tagId}",
  summary: "Update tag name",
  tags: ["Tags"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      tagId: z.string().uuid().openapi({ description: "Tag ID" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: updateTagSchema.openapi({ title: "UpdateTagInput" }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Tag updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({ tag: TagSchema }),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/tags/{tagId}",
  summary: "Delete tag",
  tags: ["Tags"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      tagId: z.string().uuid().openapi({ description: "Tag ID" }),
    }),
  },
  responses: {
    200: {
      description: "Tag deleted successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
  },
});
