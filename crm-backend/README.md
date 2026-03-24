# LeadFlow CRM — Backend API

A production-ready Node.js + Express + MongoDB backend for the Client Lead Management System.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd crm-backend
npm install
```

### 2. Set up environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
```

### 3. Start MongoDB
```bash
# Option A: Local MongoDB
mongod

# Option B: MongoDB Atlas (free cloud)
# → https://www.mongodb.com/cloud/atlas
# → Create cluster → get connection string → paste in .env
```

### 4. Seed the database (creates admin + sample leads)
```bash
npm run seed
# Output: Admin Email: admin@leadflow.com / Password: Admin@1234
```

### 5. Start the server
```bash
npm run dev   # development (auto-restart)
npm start     # production
```

Server runs at **http://localhost:5000**

---

## 📁 Project Structure

```
crm-backend/
├── src/
│   ├── server.js              # Entry point
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── User.js            # Admin user model
│   │   └── Lead.js            # Lead/contact model
│   ├── controllers/
│   │   ├── authController.js  # Auth logic
│   │   └── leadController.js  # Lead CRUD logic
│   ├── routes/
│   │   ├── authRoutes.js      # /api/auth/*
│   │   └── leadRoutes.js      # /api/leads/*
│   ├── middleware/
│   │   ├── auth.js            # JWT protect + roles
│   │   ├── validate.js        # Input validation rules
│   │   └── errorHandler.js    # Global error handler
│   └── utils/
│       └── seed.js            # DB seed script
├── .env.example
├── .gitignore
└── package.json
```

---

## 🔐 Auth API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Create new user |
| POST | `/api/auth/login` | Public | Login → returns tokens |
| POST | `/api/auth/refresh` | Public | Get new access token |
| POST | `/api/auth/logout` | 🔒 | Logout + invalidate token |
| GET | `/api/auth/me` | 🔒 | Get current user |
| PATCH | `/api/auth/change-password` | 🔒 | Change password |

### Login Request
```json
POST /api/auth/login
{
  "email": "admin@leadflow.com",
  "password": "Admin@1234"
}
```

### Login Response
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "Admin", "role": "admin" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### Using the Token
```
Authorization: Bearer <accessToken>
```

---

## 📋 Leads API

All leads endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/leads/public/submit` | Public | Website contact form |
| GET | `/api/leads/stats` | 🔒 | Dashboard statistics |
| GET | `/api/leads` | 🔒 | List leads (paginated) |
| POST | `/api/leads` | 🔒 | Create lead |
| GET | `/api/leads/:id` | 🔒 | Get single lead |
| PUT | `/api/leads/:id` | 🔒 | Update lead |
| PATCH | `/api/leads/:id/status` | 🔒 | Update status only |
| DELETE | `/api/leads/:id` | 🔒 Admin/Manager | Archive lead |
| POST | `/api/leads/:id/notes` | 🔒 | Add note |
| DELETE | `/api/leads/:id/notes/:noteId` | 🔒 | Delete note |

### Query Parameters for GET /api/leads

| Param | Example | Description |
|-------|---------|-------------|
| `page` | `?page=2` | Pagination (default: 1) |
| `limit` | `?limit=10` | Per page (default: 20, max: 100) |
| `status` | `?status=new` | Filter by status |
| `source` | `?source=web` | Filter by source |
| `priority` | `?priority=high` | Filter by priority |
| `search` | `?search=priya` | Full-text search |
| `sortBy` | `?sortBy=-createdAt` | Sort field (- = desc) |
| `startDate` | `?startDate=2026-01-01` | Date range filter |
| `endDate` | `?endDate=2026-03-31` | Date range filter |

### Create Lead
```json
POST /api/leads
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@example.com",
  "phone": "+91 98765 43210",
  "company": "Acme Corp",
  "source": "web",
  "status": "new",
  "priority": "high",
  "initialNote": "Interested in enterprise plan"
}
```

### Update Status
```json
PATCH /api/leads/:id/status
{ "status": "contacted" }
```
Valid statuses: `new` → `contacted` → `qualified` → `converted` | `lost`

### Add Note
```json
POST /api/leads/:id/notes
{ "text": "Called on March 23. Needs pricing info." }
```

### Dashboard Stats Response
```json
GET /api/leads/stats
{
  "data": {
    "overview": {
      "total": 7,
      "new": 2,
      "contacted": 2,
      "qualified": 0,
      "converted": 2,
      "lost": 1,
      "conversionRate": "28.6%"
    },
    "bySource": { "web": 3, "social": 2, "referral": 2 },
    "recentLeads": [...]
  }
}
```

---

## 🛡️ Security Features

- **JWT Access Tokens** (15min) + **Refresh Tokens** (7 days)
- **Refresh Token Rotation** — each use issues a new token
- **HttpOnly Cookies** — XSS-safe token storage
- **Password Hashing** — bcrypt with salt rounds 12
- **Rate Limiting** — 200 req/15min global, 20 req/15min for auth
- **Helmet.js** — secure HTTP headers
- **Input Validation** — express-validator on all endpoints
- **Role-Based Access** — admin / manager / viewer roles
- **Soft Delete** — leads are archived, not permanently deleted

---

## 🔗 Connect to Frontend

Replace the in-memory `leads` array in your frontend with these fetch calls:

```javascript
const API = 'http://localhost:5000/api';

// Login
const res = await fetch(`${API}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
  credentials: 'include', // send cookies
});
const { data } = await res.json();
localStorage.setItem('token', data.accessToken);

// Get leads
const leads = await fetch(`${API}/leads`, {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});
```

---

## 🌐 Deploy to Production

### Backend → Railway or Render
```bash
# Railway
npm install -g @railway/cli
railway login
railway init
railway up

# Set env vars in Railway dashboard
```

### MongoDB → MongoDB Atlas
1. Create free cluster at https://mongodb.com/atlas
2. Get connection string
3. Set `MONGO_URI` in your deployment environment

---

## 📡 Health Check
```
GET http://localhost:5000/health
→ { "success": true, "message": "LeadFlow CRM API is running" }
```
