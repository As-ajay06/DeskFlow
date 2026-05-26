# 🎫 DeskFlow — Support Ticket Triage System

DeskFlow is a full-stack support ticket management system built with the **MERN stack** (MongoDB, Express, React, Node.js). It lets teams create, view, and manage support tickets with status transitions, priority levels, and SLA tracking.

**Live Demo:**
- 🌐 Frontend: [desk-flow-xi.vercel.app](https://desk-flow-xi.vercel.app)
- 🔌 Backend API: [deskflow-2.onrender.com](https://deskflow-2.onrender.com)

---

## 📁 Project Structure

```
ticketing-system/
├── backend/          # Express + MongoDB REST API
│   ├── models/       # Mongoose data models
│   ├── routes/       # API route handlers
│   ├── server.js     # App entry point
│   └── .env          # Backend environment variables
└── frontend/         # React + Vite UI
    ├── src/
    │   ├── components/
    │   └── App.jsx
    └── .env          # Frontend environment variables
```

---

## ⚙️ Prerequisites

Make sure you have the following installed before you begin:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18 or higher | [nodejs.org](https://nodejs.org) |
| npm | v9 or higher | Comes with Node.js |
| MongoDB | Atlas (cloud) or local | [mongodb.com](https://www.mongodb.com/atlas) |
| Git | Any recent version | [git-scm.com](https://git-scm.com) |

---

## 🚀 Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/As-ajay06/DeskFlow.git
cd DeskFlow
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:

```bash
# backend/.env

PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>
FRONTEND_URL=http://localhost:5173
```

> **Replace** `<username>`, `<password>`, and `<dbname>` with your own MongoDB Atlas credentials.
> If you're running MongoDB locally, use: `MONGODB_URI=mongodb://localhost:27017/deskflow`

Start the backend dev server:

```bash
npm run dev       # uses nodemon (auto-restarts on file changes)
# or
npm start         # plain node, no auto-restart
```

The API will be available at: **http://localhost:5000**

✅ You should see:
```
Connected to MongoDB
Server running on port 5000
```

---

### 3. Frontend Setup

Open a **new terminal tab/window**, then:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend/` folder:

```bash
# frontend/.env

VITE_BACKEND_URL=http://localhost:5000
```

Start the frontend dev server:

```bash
npm run dev
```

The app will be available at: **http://localhost:5173**

---

## 🔌 API Endpoints

Base URL (local): `http://localhost:5000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/tickets` | Get all tickets |
| `GET` | `/tickets/:id` | Get a single ticket |
| `POST` | `/tickets` | Create a new ticket |
| `PATCH` | `/tickets/:id` | Update ticket (status, priority, etc.) |
| `DELETE` | `/tickets/:id` | Delete a ticket |

---

## 🌍 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port the API runs on | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `FRONTEND_URL` | Allowed frontend origin | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_BACKEND_URL` | Backend API base URL | `http://localhost:5000` |

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** — REST API server
- **MongoDB** + **Mongoose** — Database & ODM
- **CORS** — Cross-origin request handling
- **dotenv** — Environment variable management
- **nodemon** — Dev auto-reload

### Frontend
- **React 19** — UI library
- **Vite** — Build tool & dev server

---

## ☁️ Deployment

| Service | Platform | Notes |
|---------|----------|-------|
| Backend | [Render](https://render.com) | Set env vars in Render dashboard |
| Frontend | [Vercel](https://vercel.com) | Set `VITE_BACKEND_URL` to Render URL |

When deploying, update:
- `VITE_BACKEND_URL` in Vercel → point to your Render backend URL
- `FRONTEND_URL` in Render → point to your Vercel frontend URL

---

## 🐛 Common Issues

**CORS errors in browser?**
Make sure `VITE_BACKEND_URL` in `frontend/.env` matches exactly where your backend is running (no trailing slash).

**MongoDB connection failed?**
- Check your `MONGODB_URI` is correct
- Whitelist your IP address in MongoDB Atlas → Network Access → `0.0.0.0/0` for development

**Port already in use?**
```bash
# Kill whatever is using port 5000
lsof -ti:5000 | xargs kill -9
```

---

## 📄 License

MIT © [Ajay Sahani](https://github.com/As-ajay06)
