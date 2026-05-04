# 🎯 Candidate Tracker

> **Professional Monorepo** — A full-stack internal tool for managing job candidates and their applications with complete CRUD control, advanced search & filtering, and a fully type-safe backend.

---

## 📋 Project Overview

Candidate Tracker is a production-grade internal dashboard designed to streamline the recruitment pipeline. Built as a **professional monorepo**, it offers:

- 👥 **Candidate Showcase** — Browse all candidates with their full application details
- 🛠️ **Complete CRUD** — Create, read, update, and delete candidates and applications with full control
- 🔍 **Advanced Search & Filter** — Cross-entity search with multi-field filtering for lightning-fast lookups
- 🧠 **Type-Safe Backend** — End-to-end TypeScript with shared Zod schemas across the entire stack
- 🧪 **Automated Testing** — Comprehensive test coverage for API routes, validation, and search logic
- 🏗️ **Professional Monorepo** — Clean separation of concerns with shared packages and workspace orchestration

---

## 🚀 Quick Start

Follow these steps to spin up the project using automated scripts.

### 1. 🔧 Environment Configuration

Duplicate the example files — **do NOT create them from scratch**.

| Step | Action                                    |
| :--: | ----------------------------------------- |
|  📋  | `apps/api/.env.example` → `apps/api/.env` |
|  📋  | `apps/web/.env.example` → `apps/web/.env` |

#### ⚙️ Backend (`apps/api/.env`)

```env
WEB_URL="http://localhost:5173"
DATABASE_URL="postgresql://dev:dev@localhost:5432/candidate_tracker?schema=public"
PORT=3001
NODE_ENV=development
```

#### 🎨 Frontend (`apps/web/.env`)

```env
VITE_API_URL="http://localhost:3001/api"
```

---

### 2. ⚡ Automatic Setup

Run from the project root:

```bash
npm run setup
```

> 🔄 This single command handles: dependencies → Docker DB → migrations → seed data → shared package build

---

### 3. 🟢 Launch Dev Servers

```bash
npm run dev
```

|      Service      | URL                                            |
| :---------------: | ---------------------------------------------- |
|  🌐 **Web App**   | [http://localhost:5173](http://localhost:5173) |
| ⚙️ **API Server** | [http://localhost:3001](http://localhost:3001) |

---

## 🏗️ Project Architecture

This is a **professional monorepo** structured for scalability:

```
📦 candidate-tracker/
├── 📁 apps/
│   ├── ⚙️ api/          → Fastify + Prisma ORM + Zod validation
│   └── 🎨 web/          → React + TanStack Query + Tailwind CSS
└── 📁 packages/
    └── 🔗 shared/       → Shared Zod schemas & TypeScript types
```

|     Layer     | Stack                           | Purpose                                    |
| :-----------: | ------------------------------- | ------------------------------------------ |
|  ⚙️ **API**   | Fastify, Prisma, Zod            | Type-safe REST endpoints with validation   |
|  🎨 **Web**   | React, TanStack Query, Tailwind | Responsive dashboard with optimistic UI    |
| 🔗 **Shared** | TypeScript, Zod                 | Single source of truth for types & schemas |

---

## 📖 Available Scripts

|        Command         | Description                                             |
| :--------------------: | ------------------------------------------------------- |
|   🚀 `npm run setup`   | Full init: install → DB → migrate → seed → build shared |
|    🟢 `npm run dev`    | Run API + Web concurrently                              |
|     🧪 `npm test`      | Execute full test suite across workspace                |
| 🔬 `npm run db:studio` | Launch Prisma Studio GUI                                |
| 🔄 `npm run db:reset`  | Reset DB and re-run all migrations                      |

---

## 🧪 Testing

Robust test coverage for critical paths:

- ✅ API route validation (GET / POST / PATCH)
- ✅ Cross-entity search with JOIN queries
- ✅ Shared Zod schema integrity
- ✅ TypeScript type safety enforcement

```bash
npm test
```

---

## 🐳 Docker

PostgreSQL 15 runs containerized via Docker Compose.

|      Field      | Value               |
| :-------------: | ------------------- |
|   👤 **User**   | `dev`               |
| 🔑 **Password** | `dev`               |
|   📦 **Port**   | `5432`              |
| 🗄️ **Database** | `candidate_tracker` |

---

## 📌 Prerequisites

- 🐳 **Docker** running before `npm run setup`
- 🔌 **Ports** `3001`, `5173`, `5432` must be free
- 📦 **Node.js** v18+ recommended

---

> ⚡ _Built with a professional monorepo architecture for maximum maintainability, type safety, and developer experience._
