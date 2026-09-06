# Full-Stack Event Planning Application

A modern, production-ready full-stack event planning web application built with **React**, **TypeScript**, **Node.js (Express)**, **Knex.js**, and **PostgreSQL**. Featuring secure JWT authentication, rich interactive event management, real-time filtering, tag assignment, RSVP tracking, custom pagination/sorting, OpenAPI/Swagger documentation, and containerization with Docker Compose.

---

## Requirements Completion Summary

### Core Features

- [x] **Event Management**: Create, edit, delete, view event list (Upcoming vs. Past), and view detailed single event pages.
- [x] **Tags & Categories**: Tag assignment, multi-select tag filtering, public/private visibility filtering.
- [x] **Authentication & Authorization**: User signup, login, JWT access & refresh token rotation, cookie-based authentication, and strict creator-only authorization for event edit/delete.

### Technical & Engineering Expectations

- [x] **Tech Stack**: React + TypeScript frontend, Node.js + Express + TypeScript backend, PostgreSQL relational database, Knex.js query builder (no ORM).
- [x] **UI/UX**: Responsive layout built with Tailwind CSS v4, dark mode support, toast notifications, loading skeletons, modal dialogs, and interactive rich-text editor for descriptions.
- [x] **Validations & Error Handling**: Comprehensive Zod validation on both client and server, sanitized input, graceful user-facing error feedback.
- [x] **RESTful API & Database**: REST conventions, server-side pagination, sorting, search, normalized database schema design with cascade deletion constraints.

### Optional & Advanced Features Implemented

- [x] **Database & Backend**: Knex.js schema migration scripts, custom migration runner (`npm run db:migrate`), structured logging using Winston + Morgan.
- [x] **Frontend Enhancements**: Reusable UI components (custom inputs, modals, cards, badges, date pickers, rich text editor, RSVP selector).
- [x] **Testing & Documentation**: Unit test suite using Bun test runner (`bun test`), OpenAPI/Swagger interactive UI at `/docs`.
- [x] **Advanced Authentication**: JWT access token + HTTP-only refresh token rotation pattern, as well as **Email Verification** using Nodemailer (HTML emails with 24-hour verification token links).
- [x] **Event Management Enhancements**: Multi-field search (title, description, location), multi-attribute sorting (starts_at, created_at, title, popularity), full RSVP system (`Yes`, `No`, `Maybe`).
- [x] **Dockerization**: Fully dockerized application with `docker-compose.yml` orchestrating PostgreSQL, Express backend, and multi-stage Nginx frontend.

---

## 1. Engineering Decisions

### Tech Stack & Architecture

- **Frontend (React 19 + TypeScript + Vite)**: Selected Vite for lightning-fast HMR and build performance. React Query (`@tanstack/react-query`) is used for client-side API state management, cache invalidation, and optimistic UI updates. Tailwind CSS v4 provides fine-grained styling and responsive design.
- **Backend (Node.js + Express + TypeScript + Bun)**: Built using Express with TypeScript for strict type safety across request handlers and middleware. Bun is utilized as the ultra-fast JavaScript runtime and test runner.
- **Database & Query Builder (PostgreSQL + Knex.js)**: Knex.js was selected as requested to ensure direct control over SQL query generation without an ORM overhead. It handles database connections, connection pooling (`min: 2, max: 10`), transactional operations, and schema migrations.
- **Normalized Schema**:
  - `users`: ID, name, email, password hash, `is_verified`, `verification_token`, `verification_token_expires_at`, timestamp fields.
  - `events`: ID, title, description, starts_at, location, visibility (`public`/`private`), creator_id (FK -> `users.id`), timestamp fields.
  - `tags`: ID, name (unique).
  - `event_tags`: Junction table (`event_id`, `tag_id`) for many-to-many relationships.
  - `rsvps`: Junction table (`event_id`, `user_id`, `status: yes/no/maybe`) with unique constraint on `(event_id, user_id)` for single RSVP per user per event.

### Security Architecture

- **Authentication**: Uses bcryptjs to salt and hash passwords. Issues short-lived Access Tokens (15 minutes) and long-lived Refresh Tokens (30 days). Access tokens can be sent via standard Authorization Bearer header or HTTP-only cookies.
- **Email Verification**: Users receive a 24-hour verification link via Nodemailer upon signup. Login is restricted until the email is verified (`is_verified = true`), with full resend capabilities.
- **Authorization Middleware**: Protects API routes. Only the original `creator_id` of an event is authorized to mutate or delete that event.
- **Security Middleware**: Includes Helmet for secure HTTP headers, CORS configuration with dynamic origins, and input sanitization via Zod.

---

## 2. Setup Instructions

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose **OR**
- [Bun](https://bun.sh/) (or Node.js v18+) and PostgreSQL installed locally.

---

### Option A: Running via Docker Compose (Recommended)

1. **Clone the repository**:

   ```bash
   git clone https://github.com/rajan-marasini/lft_assignment.git
   cd lft_assignment
   ```

2. **Copy server environment configuration**:
   ```bash
   cp server/.env.example server/.env
   ```
   *(Update secrets in `server/.env` if needed)*

3. **Start all services**:
   ```bash
   docker compose up --build
   ```

4. **Access the application**:
   - **Frontend App**: `http://localhost:3000`
   - **Backend API**: `http://localhost:8000`
   - **Swagger API Docs**: `http://localhost:8000/docs`

---

### Option B: Running Locally (Manual Setup)

#### 1. Database Setup

Create a PostgreSQL database named `assignment`:

```sql
CREATE DATABASE assignment;
```

#### 2. Backend Setup

```bash
cd server

# Copy environment variables
cp .env.example .env

# Install dependencies
bun install

# Run database migrations
bun run db:migrate

# Start backend server in dev mode
bun run dev
```

The server will run on `http://localhost:8000`.

#### 3. Run Backend Unit Tests

```bash
cd server
bun test
```

#### 4. Frontend Setup

```bash
cd client

# Install dependencies
bun install

# Start frontend dev server
bun run dev
```

The application will be accessible at `http://localhost:3000`.

---

## 3. Assumptions

1. **Timezone & Dates**: All date and time values stored in PostgreSQL use UTC ISO string timestamps. The frontend displays local time based on the user's browser locale.
2. **Event Visibility**: `public` events are visible to all users (authenticated or guest), whereas `private` events are only visible to authenticated users or their creator.
3. **RSVP Behavior**: Any logged-in user can update their RSVP status (`yes`, `no`, `maybe`) on any viewable event. A user can update their RSVP choice at any time.
4. **Tag Normalization**: Tag names are automatically trimmed and converted to lowercase upon creation/search to prevent duplication (e.g., "Conference" and "conference" resolve to the same tag).

---

## API Documentation & Links

- **Swagger / OpenAPI Documentation**: `http://localhost:8000/docs`
- **Main Endpoints**:
  - `POST /api/auth/register` - User Registration
  - `POST /api/auth/login` - User Authentication
  - `POST /api/auth/refresh` - Refresh Access Token
  - `GET /api/events` - Get paginated/filtered list of events
  - `POST /api/events` - Create new event
  - `GET /api/events/:id` - Get event details
  - `PUT /api/events/:id` - Update event (Creator only)
  - `DELETE /api/events/:id` - Delete event (Creator only)
  - `POST /api/events/:id/rsvp` - Set RSVP status for an event
  - `GET /api/tags` - List popular tags
