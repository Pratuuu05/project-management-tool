# ⚡ ProjectFlow — Project Management Tool

A full-stack project management application built with **React**, **Node.js/Express**, and **MongoDB**.

---

## 📁 Project Structure

```
project-management-tool/
├── backend/                  # Node.js + Express API
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── models/
│   │   ├── User.js           # User schema
│   │   ├── Project.js        # Project schema
│   │   └── Task.js           # Task schema
│   ├── routes/
│   │   ├── auth.js           # /api/auth routes
│   │   ├── projects.js       # /api/projects routes
│   │   └── tasks.js          # /api/tasks routes
│   ├── .env                  # Environment variables
│   ├── package.json
│   └── server.js             # Express app entry point
│
├── frontend/                 # React application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js         # Navigation bar
│   │   │   ├── ProjectModal.js   # Create/edit project form
│   │   │   └── TaskModal.js      # Create/edit task form
│   │   ├── context/
│   │   │   └── AuthContext.js    # Auth state management
│   │   ├── hooks/
│   │   │   └── useApi.js         # Custom hooks for API calls
│   │   ├── pages/
│   │   │   ├── LoginPage.js      # Login screen
│   │   │   ├── RegisterPage.js   # Register screen
│   │   │   ├── DashboardPage.js  # Projects overview
│   │   │   └── ProjectPage.js    # Kanban board view
│   │   ├── App.js                # Router setup
│   │   └── index.css             # Global styles
│   └── package.json
│
├── package.json              # Root scripts (run both together)
└── README.md
```

---

## 🚀 Setup & Running

### Prerequisites
- Node.js v16+ installed
- MongoDB installed and running locally OR MongoDB Atlas account

### Step 1: Install Dependencies
```bash
npm run install-all
```

### Step 2: Configure Environment
Edit `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/projectmanager
JWT_SECRET=your_secret_key_here
```

### Step 3: Start MongoDB (if local)
```bash
mongod
```

### Step 4: Run the App
```bash
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Authentication | Register/Login with JWT tokens |
| 📁 Projects | Create, edit, delete projects with colors & deadlines |
| 📊 Dashboard | Overview with stats and progress tracking |
| 🗂️ Kanban Board | Drag tasks between Todo / In Progress / Review / Done |
| ✅ Tasks | Create tasks with priority, deadline, tags, assignees |
| 📈 Progress | Auto-calculated from completed tasks |
| 🎨 Dark Theme | Polished dark UI |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios |
| Styling | CSS Variables, custom components |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| Dev Tools | Nodemon, concurrently |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/projects | Get all projects |
| POST | /api/projects | Create project |
| GET | /api/projects/:id | Get single project |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project |
| GET | /api/projects/:id/stats | Get project stats |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/tasks?project=:id | Get tasks for project |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |

---

## 👨‍💻 Made for College Project Presentation
