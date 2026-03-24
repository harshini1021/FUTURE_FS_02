# LeadFlow CRM — React Frontend

Production-ready React frontend for the LeadFlow CRM system.
Connects to the Node.js/Express/MongoDB backend via Axios.

---

## 🚀 Quick Start

### Prerequisites
- Backend running at `http://localhost:5000` (see `crm-backend/`)

### 1. Install dependencies
```bash
cd crm-frontend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# In dev, leave VITE_API_URL blank — Vite proxies /api → localhost:5000 automatically
```

### 3. Start dev server
```bash
npm run dev
# → http://localhost:3000
```

### 4. Login
```
Email:    admin@leadflow.com
Password: Admin@1234
(run `npm run seed` in the backend first)
```

---

## 📁 Project Structure

```
crm-frontend/
├── index.html
├── vite.config.js          # Dev proxy: /api → localhost:5000
├── src/
│   ├── main.jsx            # Entry point
│   ├── App.jsx             # Router + AuthProvider
│   ├── styles/
│   │   └── global.css      # CSS variables + resets
│   ├── services/
│   │   └── api.js          # Axios instance + all API calls
│   │                       # Auto token refresh on 401
│   ├── context/
│   │   └── AuthContext.jsx # Global auth state (login/logout/user)
│   ├── hooks/
│   │   ├── useLeads.js     # Lead fetching + optimistic updates
│   │   └── useToast.js     # Toast notification hook
│   ├── components/
│   │   ├── UI.jsx          # Button, Input, Modal, Badge, Avatar, Toast...
│   │   ├── Layout.jsx      # Sidebar + main content shell
│   │   └── ProtectedRoute.jsx  # Redirect to /login if not authenticated
│   └── pages/
│       ├── Login.jsx       # Login page with branding panel
│       ├── Dashboard.jsx   # Stats + recent leads
│       ├── LeadsList.jsx   # Full table with filters/search/pagination
│       ├── LeadDetail.jsx  # Lead info, notes, status history
│       ├── LeadForm.jsx    # Add new / edit existing lead
│       └── Settings.jsx    # Profile + change password
```

---

## 🔐 Auth Flow

```
User visits /  →  ProtectedRoute checks localStorage for token
                  → No token?  Redirect to /login
                  → Has token? Verify with GET /api/auth/me
                    → Invalid? Clear storage + redirect /login
                    → Valid?   Render page

Login form submit → POST /api/auth/login
                  → Store accessToken + refreshToken in localStorage
                  → Set user in AuthContext
                  → Navigate to /

Token expires (15m) → Axios interceptor catches 401 TOKEN_EXPIRED
                    → POST /api/auth/refresh automatically
                    → Retry original request with new token
                    → If refresh also fails → logout + redirect /login
```

---

## 🔗 API Integration

All API calls live in `src/services/api.js`:

```js
// Leads
leadsAPI.getAll({ status: 'new', page: 1, search: 'priya' })
leadsAPI.getStats()
leadsAPI.getOne(id)
leadsAPI.create(formData)
leadsAPI.update(id, formData)
leadsAPI.updateStatus(id, 'contacted')
leadsAPI.addNote(id, 'Called on March 23. Interested!')
leadsAPI.delete(id)

// Auth
authAPI.login(email, password)
authAPI.logout()
authAPI.getMe()
authAPI.changePassword(currentPw, newPw)
```

---

## 🏗 Build for Production

```bash
npm run build
# Output: dist/

# Preview the production build locally
npm run preview
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
# Set VITE_API_URL=https://your-backend.railway.app/api
```

### Deploy to Netlify
```bash
# Build command: npm run build
# Publish dir:   dist
# Set env var:   VITE_API_URL=https://your-backend.railway.app/api
```

> **Important**: For production, add a `vercel.json` or `_redirects` file
> to handle React Router's client-side routing:
>
> **Vercel** (`vercel.json`):
> ```json
> { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
> ```
>
> **Netlify** (`public/_redirects`):
> ```
> /* /index.html 200
> ```

---

## ✨ Features

| Page | What it does |
|------|-------------|
| Login | Branded login page, demo credentials hint, show/hide password |
| Dashboard | Live stat cards, conversion funnel, recent leads table |
| All Leads | Filterable/searchable/sortable table, inline status dropdown, CSV export, pagination |
| Lead Detail | Full contact info, tabbed notes + history, one-click status update |
| Add/Edit Lead | Validated form, backend error surfacing |
| Settings | Profile info, change password form |

---

## 🛡 Security

- **HttpOnly cookies** used for token transport alongside localStorage backup
- **Token refresh** handled automatically — users never see session expiry
- **Role checks** in ProtectedRoute (pass `requiredRole` prop)
- All API errors surface via toast notifications
