# Belajar Vibe Coding

A robust and modern backend REST API service built for authentication and user management. This project serves as an implementation template showcasing a standard scalable codebase architectures utilizing the Bun ecosystem.

## 🚀 Tech Stack & Libraries
- **Runtime**: [Bun](https://bun.sh/) – A fast all-in-one JavaScript runtime.
- **Framework**: [ElysiaJS](https://elysiajs.com/) – An ergonomic, high-performance web framework for Bun.
- **API Documentation**: [Swagger UI](https://elysiajs.com/plugins/swagger.html) – Interactive API documentation and testing interface.
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) – A lightweight and type-safe TypeScript ORM.
- **Database**: MySQL (via `mysql2` driver).
- **Testing**: `bun test` – Bun's built-in, extremely fast test runner.
- **Security**: Custom password hashing and session-based authentication middleware utilizing Elysia's `plugin`/`derive` system.

## 🏗️ Architecture

The application implements a layered, controller-service architecture pattern to enforce the separation of concerns, keeping the responsibilities clean and easy to test:

1. **Routes (`src/route/`)**: Defines the API endpoints, HTTP methods, and input validation schemas using Elysia's `t` schema validator.
2. **Controllers (`src/controller/`)**: Handles incoming HTTP requests and structures the HTTP response payload. It isolates the transport layer from the business logic.
3. **Services (`src/service/`)**: Contains the core business and domain logic. Here, data processing, validations, password hashing, and token generation occur before communicating with the database layer.
4. **Models (`src/model/`)**: Defines the MySQL database schema definitions using Drizzle ORM.
5. **Middlewares (`src/middleware/`)**: Intercepts requests. The application features an `authPlugin` capable of parsing the `Authorization` header, validating the Bearer token, and injecting the authenticated user context.
6. **Config (`src/config/`)**: Contains global setups, specifically the active Drizzle and MySQL connection pooling configuration.

## 📂 Folder Structure

```text
belajar-vibe-coding/
├── src/
│   ├── config/          # Global configurations, e.g., Database connection
│   │   └── db.config.ts
│   ├── controller/      # Request routers handling the HTTP inputs/outputs
│   │   ├── auth.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/      # Application-level and route-level middlewares 
│   │   └── auth.middleware.ts
│   ├── model/           # Drizzle ORM table definitions
│   │   ├── session.model.ts
│   │   └── user.model.ts
│   ├── route/           # Elysia API groupings and validation schemas
│   │   ├── auth.route.ts
│   │   └── user.route.ts
│   ├── service/         # Core business logic processing models
│   │   ├── auth.service.ts
│   │   └── user.service.ts
│   ├── utils/           # Shared utility functions (Error handlers, Password hashing)
│   │   ├── error.ts
│   │   └── password.util.ts
│   ├── app.ts           # Central Elysa application entry and global error configurations
│   └── index.ts         # Application initialization and port listener
├── test/                # Test suite built with bun test
│   ├── api.test.ts      # Main integration test scenarios
│   └── setup.ts         # Testing setup and teardown utilities
├── drizzle.config.ts    # Drizzle-Kit migration configuration
├── issue.md             # Project requirements planning document
└── package.json         # Package manager dependencies and project scripts
```

## 🗄️ Database Schema

The database is built on MySQL using Drizzle ORM and consists of two primary tables to manage users and their authentication sessions:

### `users`
- `id` (serial, primary key)
- `username` (varchar 255, not null)
- `email` (varchar 255, not null, unique)
- `password` (varchar 255, not null) - Securely hashed string.
- `created_at` (timestamp, default `now()`)
- `updated_at` (timestamp, default `now()`, on update `now()`)

### `sessions`
- `id` (serial, primary key)
- `token` (varchar 255, not null) - Contains a universally unique identifier (UUID) as the session token.
- `user_id` (bigint, not null) - Foreign key constraint referencing `users.id`.
- `created_at` (timestamp, default `now()`)

*(A user can have multiple active sessions simultaneously if logging in across multiple devices).*

## 📡 Available APIs

Base URL mapping defaults to `localhost` with the respective development port.

### 1. Register User
- **Endpoint**: `POST /api/v1/user`
- **Description**: Registers a new user into the database.
- **Body Payload**:
   - `username` (string, min 3 chars)
   - `email` (string, valid email format)
   - `password` (string, min 8 chars)
- **Response**: `200 OK` (user data without password) / `400 Bad Request` (validation errors/duplicate email)

### 2. Login User
- **Endpoint**: `POST /api/users/login`
- **Description**: Authenticates the user and returns an active session token.
- **Body Payload**:
   - `email` (string)
   - `password` (string)
- **Response**: `200 OK` (session token and timestamp) / `400 Bad Request` (incorrect credentials)

### 3. Get Current User (Protected)
- **Endpoint**: `GET /api/users/current-user`
- **Description**: Retrieves the profile data of the currently authenticated user.
- **Headers**:
   - `Authorization: Bearer <token>`
- **Response**: `200 OK` (user profile data) / `401 Unauthorized` (missing, invalid, or expired tokens)

### 4. Logout User (Protected)
- **Endpoint**: `DELETE /api/users/logout`
- **Description**: Invalidates and removes the current active session token from the database.
- **Headers**:
   - `Authorization: Bearer <token>`
- **Response**: `200 OK` ("OK") / `401 Unauthorized`

## 📖 API Documentation (Swagger UI)

This project features an interactive Swagger UI documentation that allows developers to explore and test the API directly from the browser.

### Features
- **Interactive Testing**: Execute API calls directly from the UI.
- **Schema Visualization**: Understand the required body payloads and response structures.
- **Authentication Support**: Built-in support for Bearer Token authentication.

### How to Access
1. Start the server (e.g., `bun run dev`).
2. Open your browser and navigate to: `http://localhost:<PORT>/swagger`
   - *Example: `http://localhost:3000/swagger`*

### How to Use Auth
1. Obtain a token by calling the **Login** API.
2. Click the **"Authorize"** padlock button in the Swagger UI.
3. Enter your token (Prefix with `Bearer ` if necessary, though the UI is configured for standard Bearer format).
4. Click **Authorize** and then **Close**. You can now test protected endpoints!

## ⚙️ Project Setup

### Prerequisites
- Node.js environment installed.
- [Bun](https://bun.sh/) installed locally.
- Access to a running MySQL server instances.

1. **Clone the repository**:
   ```bash
   git clone <remote-repo-url>
   cd belajar-vibe-coding
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and configure your MySQL database connection:
   ```env
   DATABASE_URL="mysql://<user>:<password>@<host>:<port>/<test_database_name>"
   ```

4. **Initialize Database** (Migrations):
   Create the tables on your configured MySQL database by executing Drizzle Kit:
   ```bash
   bun run db:push
   ```

## 🚀 How to Run

To run the application locally in development mode (which enables automatic hot-reloading on files change):

```bash
bun run dev
```

The application will start, and the console will output the active server connection.

Optional: To inspect the database schema natively within your browser, execute:
```bash
bun run db:studio
```

## 🧪 How to Test

An integration test suite is located inside the `/test` directory. It uses the `bun test` built-in test runner to execute comprehensive endpoints validations.

> **⚠️ WARNING**: The test execution contains a teardown script (`test/setup.ts`) that **WIPES OUT ALL DATA** from the `users` and `sessions` database tables prior to each test case. Before initiating these scripts, double-check that your `.env` contains a dedicated development or testing database schema instance, **NOT** a production instance.

To orchestrate the API tests:
```bash
bun test
```
This single command executes 16 test case scenarios covering optimal flows and edge boundary faults.
