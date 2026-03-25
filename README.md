# ⚡ LeadFlow - Premium Client Lead Management System

![LeadFlow CRM Header](https://via.placeholder.com/1200x600/0f172a/6366f1?text=LeadFlow+CRM+-+Premium+Glassmorphism+Dashboard)

LeadFlow is a full-stack, enterprise-grade Client Lead Management System (Mini CRM) designed for agencies, freelancers, and growing startups. It features a breathtaking Glassmorphism user interface designed to provide an immersive, highly tactile experience while tracking and converting leads.

## 🌟 Key Features

### 🎨 Stunning Premium Interface
- **True Glassmorphism Design:** Deep indigo backdrops with `backdrop-filter` blurring, floating translucent components, and dynamic glowing accents.
- **Fluid Micro-Animations:** Tactile buttons, hovering stat cards, animated funnels, and extremely smooth page transitions.
- **Responsive Layout:** Beautiful grid-based layouts that gracefully adapt to various screen sizes.

### 📊 Powerful Data Visualizations
- **Interactive Dashboard:** Live data rendering through `recharts`.
- **Acquisition Trends:** An SVG-based Area Chart tracking lead volume over a 7-day rolling period.
- **Data Distribution:** A sleek Donut Chart indicating your highest performing lead sources (Web, Referral, Cold, etc.).

### 📅 Pipeline Calendar View
- **CSS Grid Calendar:** Visualizes the entire pipeline in an intuitive monthly calendar format.
- **Acquisition Mapping:** Automatically plots leads to their exact entry dates so you can visualize when your marketing efforts paid off.

### 🛡️ Secure Admin Controls
- **Role-Based Authentication (RBAC):** Distinct `admin` and `viewer` roles explicitly preventing unauthorized data manipulation.
- **JWT Protection:** Short-lived access tokens with robust refresh-token rotation ensure sessions aren't compromised.
- **Security Hardened backend:** Built with `express-rate-limit`, `helmet`, and `cors` to defend against automated threats.

---

## 💻 Tech Stack

- **Frontend:** React 18, Vite, React Router DOM, Recharts, Context API.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB, Mongoose.
- **Authentication:** JSON Web Tokens (JWT), bcrypt.js.

---

## 🚀 Quick Start Local Setup

### 1. Requirements
- Node.js installed on your machine.
- A local MongoDB instance OR a free MongoDB Atlas Cluster URI.

### 2. Configure Environment variables
Create a `.env` file in the `crm-backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=super_secret_key_for_access_tokens
JWT_REFRESH_SECRET=another_super_secret_for_refresh_tokens
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Create a `.env` file inside the `crm-frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Installation & Running

**Terminal 1: Start the Backend server**
```bash
cd crm-backend
npm install
npm run seed  # (Optional) Seed the database with fake initial data
npm run dev
```

**Terminal 2: Start the Frontend UI**
```bash
cd crm-frontend
npm install
npm run dev
```

Your premium CRM is now live locally at `http://localhost:5173`!

---

## 👥 Authors
Designed & Developed for a final submission portfolio.
