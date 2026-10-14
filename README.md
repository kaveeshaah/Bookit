# Bookit — Resource Reservation Management System

A centralized digital reservation platform designed to organize shared facilities, eliminate double-bookings, and provide complete visibility into organizational resource availability.

Developed as a technical assessment for **PrimeWave Lab (Pvt) Ltd**.

---

## Table of Contents
1. [Business Problem & Solution](#business-problem--solution)
2. [Key Engineering Decisions](#key-engineering-decisions)
3. [Technology Stack](#technology-stack)
4. [Architecture & Project Structure](#architecture--project-structure)
5. [Database Schema & ER Diagram](#database-schema--er-diagram)
6. [Getting Started (Local Setup)](#getting-started-local-setup)
   - [Option A: Docker Compose (Recommended)](#option-a-docker-compose-recommended)
   - [Option B: Local PostgreSQL](#option-b-local-postgresql)
7. [Running Tests](#running-tests)
8. [Available Scripts](#available-scripts)

---

## Business Problem & Solution

### The Challenge
As organizations grow, managing shared assets (conference rooms, project equipment, company vehicles) through manual notes or informal messaging leads to:
- Double-bookings and overlapping time slots
- Inability to quickly check real-time availability
- Operational delays due to uncoordinated cancellations

### The Solution
**Bookit** centralizes resource and reservation management with:
- **Visual Availability Timeline**: Color-coded day-at-a-glance schedule showing occupied and free windows.
- **Race-Condition-Proof Double-Booking Guard**: Enforced at the database level via PostgreSQL exclusion constraints.
- **Full Resource Lifecycle**: Create, edit with live icon previews, view detailed schedules, and deactivate/reactivate resources.
- **Defensive User Experience**: Confirmation pop-up modals for cancellations and discards, and preservation of form inputs upon conflict errors.

---

## Key Engineering Decisions

### 1. PostgreSQL GiST Exclusion Constraint vs. Application-Level Locking
Traditional applications check for conflicts using a `SELECT` query followed by an `INSERT`. Under concurrent requests, this creates a **race condition** where two users can book the same slot simultaneously.

Bookit solves this decisively at the PostgreSQL engine level using the `btree_gist` extension:
```sql
EXCLUDE USING gist (
  resource_id WITH =,
  tstzrange(start_time, end_time) WITH &&
) WHERE (status = 'confirmed');
```
- PostgreSQL enforces that no two confirmed reservations for the same resource can have overlapping time ranges (`&&`).
- Cancelled reservations are safely excluded, freeing up slots immediately.
- The service catches PostgreSQL error code `23P01` and translates it into a friendly user alert without crashing.

### 2. Next.js App Router & Server Actions
- **Server-First Architecture**: Server components stream data directly from PostgreSQL using Prisma Client, minimizing client bundle size.
- **React 19 `useActionState`**: Server actions handle validation, service calls, and cache revalidation (`revalidatePath`).
- **Dynamic Form Key Remounting**: Forms utilize a calculated key based on returned `state.values`. If a conflict error occurs, the form remounts with all 5 fields pre-filled, preventing uncontrolled dropdown resets.

### 3. Interactive Modals for Destructive Actions
Accidental clicks on destructive actions (cancelling a reservation or discarding uncommitted edits) are guarded by an accessible `Modal` dialog with Escape key support, backdrop trapping, and distinct danger/warning tones.

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) 16 (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) 5 |
| **Database** | [PostgreSQL](https://www.postgresql.org/) 14+ with `btree_gist` |
| **ORM / Client** | [Prisma](https://www.prisma.io/) 7 with `@prisma/adapter-pg` |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) 4 |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Validation** | [Zod](https://zod.dev/) |
| **Testing** | Native Node.js Test Runner with `tsx` |

---

## Architecture & Project Structure

```
bookit/
├── database/
│   └── schema.sql              # Source of truth PostgreSQL DDL (includes GiST exclusion)
├── docs/
│   └── er-diagram.md           # Entity Relationship Diagram & relationships
├── prisma/
│   ├── schema.prisma           # Prisma models for types and client generation
│   └── seed.ts                 # Seed script with users, resources, and bookings
├── public/                     # Static assets and icons
├── src/
│   ├── app/                    # Next.js App Router routes
│   │   ├── (dashboard)/page.tsx# Analytics, quick metrics, upcoming bookings
│   │   ├── resources/          # List, detail timeline, create, and edit routes
│   │   ├── reservations/       # Reservation list and new booking form
│   │   └── login/              # Authentication view
│   ├── components/             # Reusable UI & domain components
│   │   ├── reservations/       # DayTimeline, ReservationForm, CancelReservationButton
│   │   ├── resources/          # ResourceForm, DateNavigator
│   │   └── ui/                 # Modal, Badge, ResourceIcon, StatCard
│   ├── lib/                    # Database client pool, date helpers
│   ├── server/                 # Business logic services and Server Actions
│   │   ├── actions/            # resources.ts, reservations.ts
│   │   └── services/           # reservation-service.ts, resource-service.ts
│   └── validation/             # Zod input validation schemas
├── tests/
│   └── reservation-service.test.ts # Automated test suite
├── docker-compose.yml          # Containerized PostgreSQL service
└── package.json
```

---

## Database Schema & ER Diagram

The database consists of three core entities:
1. `users`: Organization members and administrators.
2. `resources`: Reservable physical items (rooms, equipment, vehicles).
3. `reservations`: Time-bound bookings with foreign keys to users and resources.

For the full visual diagram and entity definitions, see:
👉 **[Entity Relationship (ER) Diagram](docs/er-diagram.md)**

---

## Getting Started (Local Setup)

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or later
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) (Optional, for Option A) **OR** local [PostgreSQL](https://www.postgresql.org/) 14+ (for Option B)

---

### Option A: Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/bookit.git
   cd bookit
   ```

2. **Configure environment variables**:
   Create a `.env` file in the project root:
   ```env
   DATABASE_URL="postgresql://postgres:kavee@localhost:5432/Bookit"
   ```

3. **Start PostgreSQL via Docker Compose**:
   ```bash
   docker compose up -d
   ```
   *This automatically creates the database, enables `btree_gist`, and executes `database/schema.sql`.*

4. **Install dependencies & generate Prisma client**:
   ```bash
   npm install
   ```

5. **Seed sample data**:
   ```bash
   npm run db:seed
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Option B: Local PostgreSQL

1. **Clone the repository & install dependencies**:
   ```bash
   git clone https://github.com/<your-username>/bookit.git
   cd bookit
   npm install
   ```

2. **Initialize Database**:
   Execute `database/schema.sql` against your PostgreSQL server:
   ```bash
   psql -U postgres -d postgres -c "CREATE DATABASE \"Bookit\";"
   psql -U postgres -d Bookit -f database/schema.sql
   ```

3. **Configure `.env`**:
   ```env
   DATABASE_URL="postgresql://<user>:<password>@localhost:5432/Bookit"
   ```

4. **Seed database & run**:
   ```bash
   npm run db:seed
   npm run dev
   ```

---

## Running Tests

An automated test suite verifies reservation creation, double-booking rejection via exclusion constraints, inactive resource guards, and cancellation rules:

```bash
npm run test
```

Expected output:
```
✔ should successfully create a confirmed reservation
✔ should prevent overlapping reservation for the same resource (double-booking guard)
✔ should disallow booking an inactive resource
✔ should allow cancelling an upcoming reservation
✔ should disallow cancelling past reservations
```

---

## Available Scripts

- `npm run dev` — Starts local development server on port 3000.
- `npm run build` — Validates TypeScript and creates optimized production build.
- `npm run start` — Starts production server.
- `npm run test` — Executes automated test suite.
- `npm run db:seed` — Seeds sample resources, users, and reservations.
- `npm run lint` — Runs ESLint checks.
