# MediLab Report Portal

A modern, enterprise-grade healthcare web application for managing patient blood test reports.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| State | Redux Toolkit |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT + Refresh Tokens |
| Storage | Cloudinary |
| Email | Nodemailer |

## Project Structure

```
medilab-portal/
├── backend/
│   └── src/
│       ├── config/         # DB + Cloudinary config
│       ├── controllers/    # Business logic
│       ├── middleware/      # Auth, upload, error handlers
│       ├── models/          # Mongoose schemas
│       ├── routes/          # Express routers
│       ├── utils/           # JWT, email, audit helpers
│       └── server.js
└── frontend/
    └── src/
        ├── api/             # Axios instance + service functions
        ├── components/      # Reusable UI components
        ├── pages/           # Route-level page components
        ├── store/           # Redux slices + store
        └── App.jsx
```

## Quick Start

### 1. Backend

```bash
cd backend
# Copy .env and fill in your values
npm install
npm run dev        # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

### Required .env values (backend)

```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/medilab
JWT_SECRET=<32+ char random string>
JWT_REFRESH_SECRET=<32+ char random string>
CLOUDINARY_CLOUD_NAME=<your cloud name>
CLOUDINARY_API_KEY=<your api key>
CLOUDINARY_API_SECRET=<your api secret>
EMAIL_USER=<your gmail>
EMAIL_PASS=<app password>
CLIENT_URL=http://localhost:5173
```

## User Roles

| Role | Access |
|---|---|
| `admin` | Full access — patients, reports, users, analytics |
| `lab_staff` | Upload reports, search patients, view reports |
| `patient` | View own reports, download, notifications |

## API Endpoints

### Auth
- `POST /api/auth/login` — Login with email/mobile + role
- `POST /api/auth/refresh` — Refresh access token
- `POST /api/auth/logout` — Logout
- `POST /api/auth/forgot-password` — Send OTP
- `POST /api/auth/reset-password` — Reset with OTP
- `POST /api/auth/change-password` — Change (authenticated)

### Patients
- `GET /api/patients?search=&page=&limit=`
- `POST /api/patients`
- `PUT /api/patients/:id`
- `DELETE /api/patients/:id`

### Reports
- `GET /api/reports?patientId=&status=&category=&search=`
- `POST /api/reports` (multipart/form-data)
- `GET /api/reports/:id/download`
- `PATCH /api/reports/:id/status`
- `DELETE /api/reports/:id`

### Analytics (Admin only)
- `GET /api/analytics/stats`
- `GET /api/analytics/monthly?year=`
- `GET /api/analytics/top-tests`
- `GET /api/analytics/activity`

## Security Features

- ✅ JWT Access + Refresh Tokens
- ✅ bcrypt password hashing (12 rounds)
- ✅ Account lockout after 5 failed attempts (30 min)
- ✅ OTP-based password reset (10 min expiry)
- ✅ Role-Based Access Control (RBAC)
- ✅ API rate limiting (100 req/15min)
- ✅ Helmet.js security headers
- ✅ CORS restriction to frontend origin
- ✅ Input validation
- ✅ Audit logging

## Default Credentials (Seed)

Create an admin manually via MongoDB or with a seed script:
```js
// Seed admin user
db.users.insertOne({
  name: "Admin User",
  email: "admin@medilab.com",
  password: "<bcrypt hash of 'Admin@123'>",
  role: "admin",
  status: "active"
})
```
