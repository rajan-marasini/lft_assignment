# Event Planner API

## Database setup

The backend uses PostgreSQL with Knex. The normalized schema contains users, events, tags,
and an event-to-tag junction table. Event ownership is represented by `events.creator_id`.

Copy `.env.example` to `.env`, then either provide your own PostgreSQL database or start the
included local service:

```bash
bun install
docker compose up -d database
bun run db:migrate
```

Useful commands:

```bash
bun run start        # verify the database connection
bun run db:migrate   # apply pending migrations
bun run db:rollback  # roll back the latest migration batch
bun run typecheck
```

## Logging

Use the shared Winston instance from any backend module:

```ts
import { logger } from "./lib/logger.ts";

logger.info("Event created", { eventId, creatorId });
logger.error("Event creation failed", { error });
```

Development logs are colorized and readable. With `NODE_ENV=production`, logs are emitted
as structured JSON. Set `LOG_LEVEL` to control verbosity (`debug`, `info`, `warn`, or
`error`).
