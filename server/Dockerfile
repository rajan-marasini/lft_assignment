# Use official Bun image as base
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy application code
COPY . .

# Expose server port
EXPOSE 8000

# Run migrations and start server
CMD ["sh", "-c", "bun run db:migrate && bun run start"]
