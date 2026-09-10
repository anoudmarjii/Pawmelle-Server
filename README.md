# 🐾 Pawmelle Backend (Express + PostgreSQL)

This is the backend for **Pawmelle**, a full-stack pet care and appointment booking web application.

The backend provides REST APIs for authentication, users, pets, services, and appointments. It also implements session-based authentication and role-based authorization for regular users and administrators.

---

## 🏗️ Tech Stack

- Node.js
- Express.js
- PostgreSQL
- `pg`
- `dotenv`
- `cors`
- `express-session`
- `bcrypt`

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <backend-repository-url>
```

### 2. Navigate to the Project Folder

```bash
cd Pawmelle-Server
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Create the PostgreSQL Database

Create a PostgreSQL database named:

```text
Pawmelle
```

Then run the provided `schema.sql` file to create the required tables and insert the initial data.

You can run the schema using pgAdmin Query Tool or PostgreSQL CLI.

Example:

```bash
psql -d Pawmelle -f routes/schema.sql
```

### 5. Create the Environment File

Create a `.env` file in the project root:

```env
PORT=5000

DATABASE_URL=postgresql://postgres:<your-password>@localhost:5432/Pawmelle

SESSION_SECRET=<your-session-secret>
```

Replace `<your-password>` and `<your-session-secret>` with your own values.

### 6. Start the Server

```bash
npm run dev
```

The API will run on:

```text
http://localhost:5000
```

---

## 📁 Project Structure

```text
Pawmelle-Server/
│
├── db/
│   └── db.js
│
├── middleware/
│   └── authMiddleware.js
│
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── pets.js
│   ├── services.js
│   ├── appointments.js
│   └── schema.sql
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

---

# 📡 API Endpoints

The API runs on:

```text
http://localhost:5000
```

---

## 🔐 Authentication Routes

**Base URL:** `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Register a new user |
| POST | `/login` | Log in an existing user |
| GET | `/me` | Get the currently logged-in user |
| POST | `/logout` | Log out and destroy the session |

---

### 🔸 POST `/api/auth/signup`

Registers a new regular user and creates their first pet.

Example request:

```json
{
  "name": "Anoud",
  "email": "anoud@example.com",
  "phone": "078899167",
  "petType": "Dog",
  "petAge": 3,
  "password": "123456"
}
```

The password is hashed using `bcrypt` before being stored in PostgreSQL.

---

### 🔸 POST `/api/auth/login`

Logs in an existing user.

```json
{
  "email": "anoud@example.com",
  "password": "123456"
}
```

If the credentials are correct, a session is created for the user.

---

### 🔸 GET `/api/auth/me`

Returns information about the currently logged-in user.

Example response:

```json
{
  "user": {
    "id": 2,
    "name": "Anoud",
    "email": "anoud@example.com",
    "phone": "078899167",
    "role": "user"
  }
}
```

---

### 🔸 POST `/api/auth/logout`

Destroys the current user session and logs the user out.

---

# 👤 User Routes

**Base URL:** `/api/users`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | Get all registered users | Admin |
| PUT | `/profile` | Update logged-in user's profile | User |
| DELETE | `/:id` | Delete a user by ID | Admin |

---

### 🔸 PUT `/api/users/profile`

Updates the profile of the currently logged-in user.

```json
{
  "name": "Anoud Marji",
  "email": "anoud@example.com",
  "phone": "078899167"
}
```

---

### 🔸 DELETE `/api/users/:id`

Allows an administrator to delete a registered user.

Example:

```text
DELETE /api/users/4
```

---

# 🐶 Pet Routes

**Base URL:** `/api/pets`

All pet routes require the user to be logged in.

Users can only access and modify pets that belong to their own account.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all pets belonging to the logged-in user |
| GET | `/:id` | Get one pet |
| POST | `/` | Add a new pet |
| PUT | `/:id` | Update a pet |
| DELETE | `/:id` | Delete a pet |

---

### 🔸 POST `/api/pets`

Creates a new pet for the currently logged-in user.

```json
{
  "species": "Dog",
  "breed": "Golden Retriever",
  "age": 3
}
```

---

### 🔸 PUT `/api/pets/:id`

Updates an existing pet.

```json
{
  "species": "Dog",
  "breed": "Pomeranian",
  "age": 4
}
```

---

### 🔸 DELETE `/api/pets/:id`

Deletes a pet belonging to the currently logged-in user.

Example:

```text
DELETE /api/pets/3
```

---

# 🩺 Service Routes

**Base URL:** `/api/services`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | Get all services | Public |
| GET | `/:id` | Get one service | Public |
| POST | `/` | Add a new service | Admin |
| PUT | `/:id` | Update a service | Admin |
| DELETE | `/:id` | Delete a service | Admin |

---

### 🔸 POST `/api/services`

Adds a new pet care service.

```json
{
  "name": "General Checkup",
  "description": "A complete general health assessment for your pet.",
  "price": 20,
  "duration": 30
}
```

---

### 🔸 PUT `/api/services/:id`

Updates an existing service.

```json
{
  "name": "General Checkup",
  "description": "Updated general health assessment.",
  "price": 25,
  "duration": 45
}
```

---

# 📅 Appointment Routes

**Base URL:** `/api/appointments`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | Get the logged-in user's appointments | User |
| POST | `/` | Create a new appointment | User |
| PUT | `/:id/cancel` | Cancel an appointment | User |
| GET | `/admin/all` | Get all appointments | Admin |
| PUT | `/:id/status` | Accept or reject an appointment | Admin |

---

### 🔸 POST `/api/appointments`

Creates a new appointment.

```json
{
  "pet_id": 2,
  "service_id": 3,
  "appointment_date": "2026-09-22",
  "appointment_time": "13:00"
}
```

New appointments are created with a default status of:

```text
pending
```

---

### 🔸 PUT `/api/appointments/:id/cancel`

Allows a user to cancel one of their own appointments.

Example:

```text
PUT /api/appointments/5/cancel
```

The appointment is not deleted from the database. Its status is changed to:

```text
cancelled
```

---

### 🔸 GET `/api/appointments/admin/all`

Returns all appointments in the system with related user, pet, and service information.

This route is available only to administrators.

---

### 🔸 PUT `/api/appointments/:id/status`

Allows an administrator to approve or reject an appointment.

Approve:

```json
{
  "status": "accepted"
}
```

Reject:

```json
{
  "status": "rejected"
}
```

Only `accepted` and `rejected` are accepted by this route.

---

# 🔒 Authentication and Authorization

Pawmelle uses **cookie-based sessions** for authentication.

After a successful login, the server stores the user's ID and role inside the session.

Two middleware functions are used:

### `requireLogin`

Protects routes that require the user to be authenticated.

Examples:

```text
/api/pets
/api/appointments
/api/users/profile
```

### `requireAdmin`

Protects administrator-only routes.

Examples:

```text
GET /api/users
DELETE /api/users/:id
GET /api/appointments/admin/all
PUT /api/appointments/:id/status
POST /api/services
PUT /api/services/:id
DELETE /api/services/:id
```

A regular user cannot access administrator functionality.

---

# 🗄️ Database

Pawmelle uses **PostgreSQL**.

The main database tables are:

- `users`
- `pets`
- `services`
- `appointments`

Relationships are implemented using foreign keys between users, pets, services, and appointments.

The complete database structure and initial data are provided in:

```text
routes/schema.sql
```

---

# 🔗 Frontend

This backend is designed to work with the **Pawmelle React frontend**.

During local development, the frontend normally runs on:

```text
http://localhost:5173
```

while this backend runs on:

```text
http://localhost:5000
```