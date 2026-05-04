
# Candidate Tracker

A professional internal tool for managing job applicants and interview applications.

---

## 🚀 Quick Start

Follow these steps to initialize and run the project using the automated scripts.

### 1. Environment Configuration

You must create `.env` files in both the API and Web applications.

#### Backend  

Create: `apps/api/.env`

```env
WEB_URL="http://localhost:5173"
DATABASE_URL="postgresql://dev:dev@localhost:5432/candidate_tracker?schema=public"
PORT=3001
NODE_ENV=development
````

#### Frontend

Create: `apps/web/.env`

```env
VITE_API_URL="http://localhost:3001/api"
```

---

### 2. Automatic Setup

Run the following command from the root directory:

```bash
npm run setup
```

This will:

* Install dependencies
* Start database (Docker)
* Run migrations
* Seed data
* Build shared packages

---

### 3. Run Development Servers

Start both backend and frontend concurrently:

```bash
npm run dev
```

* 🌐 Web App: [http://localhost:5173](http://localhost:5173)
* ⚙️ API: [http://localhost:3001](http://localhost:3001)

---

## 🛠 Project Structure

This project is a monorepo organized as follows:

* `apps/api` → Fastify server with Prisma ORM and Zod validation
* `apps/web` → React frontend using TanStack Query and Tailwind CSS
* `packages/shared` → Shared Zod schemas and TypeScript types

---

## 📖 Available Commands

| Command             | Description                                                           |
| ------------------- | --------------------------------------------------------------------- |
| `npm run setup`     | Full initialization (Install + DB Up + Migrate + Seed + Build Shared) |
| `npm run dev`       | Runs API and Web apps concurrently                                    |
| `npm test`          | Runs all tests across the workspace                                   |
| `npm run db:studio` | Opens Prisma Studio to view database data                             |
| `npm run db:reset`  | Resets the database and re-runs migrations                            |

---

## 🧪 Testing

The project includes tests for core logic, including:

* API route validation (GET/POST/PATCH)
* Cross-entity search logic (JOIN queries)
* Shared Zod schema validation

Run tests:

```bash
npm test
```

---

## 🐳 Docker

The database runs on PostgreSQL 15 via Docker Compose.

* 👤 User: `dev`
* 🔑 Password: `dev`
* 📦 Port: `5432`

---

## 📌 Notes

* Make sure Docker is running before executing `npm run setup`
* Ensure ports `3001`, `5173`, and `5432` are free
* Recommended Node.js version: 18+

---
