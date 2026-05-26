
<div align="center">

# Tax Mate

### Your AI-Powered Indian Tax Assistant

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![OpenRouter](https://img.shields.io/badge/AI-OpenRouter-FF6B35?style=for-the-badge&logo=openai&logoColor=white)](https://openrouter.ai/)

*A full-stack web application that simplifies Indian tax filing, calculation, and guidance using AI.*

</div>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🪄 About the Project

**Tax Mate** is a project designed to make Indian taxation
simple and accessible for everyone. It combines a React-based frontend with a
Node.js/Express backend and integrates AI (via OpenRouter) to provide real-time
tax assistance, PDF receipt scanning, and tax calculation under both Old and New
tax regimes.

> 💡 Built as a  Project — designed to demonstrate full-stack web development
> skills with real-world AI integration.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **User Authentication** | Secure register/login with JWT tokens and bcrypt password hashing |
| 🧮 **Tax Calculator** | Calculate income tax under Old & New regime|
| 🤖 **AI Tax Chatbot** | Ask any tax question and get instant AI-powered answers |
| 📄 **PDF Receipt Scanner** | Upload receipts/documents and extract tax-relevant data using AI |
| 📊 **Tax Dashboard** | Visual charts showing your income, deductions & tax breakdown |
| 📜 **Tax History** | View and manage all past tax calculations |
| 🛡️ **Admin Panel** | Manage users, view all records, promote/demote roles |
| 📈 **Tax Guide** | Comprehensive guide on Indian tax slabs, deductions & exemptions |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** — UI framework
- **React Router v7** — Client-side routing
- **Framer Motion** — Animations
- **Axios** — HTTP requests
- **Tailwind CSS** — Styling
- **Lucide React** — Icons

### Backend
- **Node.js + Express 5** — REST API server
- **MongoDB + Mongoose** — Database (with local JSON fallback)
- **JWT (jsonwebtoken)** — Authentication tokens
- **bcryptjs** — Password hashing
- **Multer** — File uploads (PDF handling)
- **pdf-parse** — PDF text extraction
- **OpenAI SDK (via OpenRouter)** — AI chat & analysis

### AI & Services
- **OpenRouter API** — AI model routing (GPT / LLaMA etc.)
- **MongoDB Atlas** — Cloud database

---

## 📁 Project Structure

```
Magical-Tax-Genie/
├── 📂 backend/
│   ├── 📂 middleware/
│   │   ├── authMiddleware.js      # JWT authentication guard
│   │   └── adminMiddleware.js     # Admin role guard
│   ├── 📂 models/
│   │   ├── User.js                # User schema (MongoDB)
│   │   ├── TaxRecord.js           # Tax record schema
│   │   └── fallbackDb.js          # Local JSON fallback DB
│   ├── 📂 routes/
│   │   ├── auth.js                # Register / Login / Profile
│   │   ├── taxRoutes.js           # Tax calculation & history
│   │   ├── taxChat.js             # AI chatbot & PDF scanner
│   │   └── adminRoutes.js         # Admin management routes
│   ├── 📂 data/
│   │   └── users.json             # Local fallback user data
│   ├── .env.example               # Environment variable template
│   ├── server.js                  # Express app entry point
│   └── package.json
│
├── 📂 frontend/
│   ├── 📂 public/                 # Static assets
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── Navbar.js          # Navigation bar
│   │   │   ├── TaxChatbot.jsx     # AI chat widget
│   │   │   ├── TaxBarChart.jsx    # Tax visualization chart
│   │   │   ├── TaxGuide.js        # Tax information guide
│   │   │   └── ProtectedRoute.js  # Route auth guard
│   │   ├── 📂 pages/
│   │   │   ├── Login.js           # Login page
│   │   │   ├── Register.js        # Registration page
│   │   │   ├── Dashboard.js       # Main user dashboard
│   │   │   ├── Calculator.js      # Tax calculator page
│   │   │   ├── AIAssistantPage.js # Full AI assistant page
│   │   │   ├── TaxHistory.js      # Past calculations
│   │   │   ├── AdminDashboard.js  # Admin control panel
│   │   │   └── AdminLogin.js      # Admin login page
│   │   ├── 📂 services/
│   │   │   └── api.js             # Axios API service layer
│   │   ├── 📂 utils/
│   │   │   ├── calculateTax.js    # Tax calculation logic
│   │   │   ├── taxCalculator.js   # Extended calculator utils
│   │   │   └── taxSlabs.js        # Indian tax slab data
│   │   └── 📂 styles/             # CSS stylesheets
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works)
- [OpenRouter](https://openrouter.ai/) API key (free credits available)

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/Magical-Tax-Genie.git
cd Magical-Tax-Genie
```

---

### 2. Setup the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in your values in `backend/.env`, then:

```bash
npm start
```

> ✅ Backend runs on **http://localhost:5000**

---

### 3. Setup the Frontend

Open a **new terminal** and run:

```bash
cd frontend
npm install
npm start
```

> ✅ Frontend runs on **http://localhost:3000**

---

## 🔐 Environment Variables

Create `backend/.env` with:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

| Variable | Description |
|---|---|
| `PORT` | Port for the Express server (default: 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `OPENROUTER_API_KEY` | API key from openrouter.ai |

> ⚠️ **Never commit your `.env` file!** It is already in `.gitignore`.

---

## 📡 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register a new user |
| `POST` | `/login` | Login and receive JWT token |
| `GET` | `/profile` | Get logged-in user profile |
| `PUT` | `/profile` | Update user profile |

### Tax — `/api/tax`
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/calculate` | Calculate income tax |
| `GET` | `/history` | Get user's tax history |
| `DELETE` | `/history/:id` | Delete a tax record |

### AI Chat — `/api/tax-chat`
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/chat` | Send message to AI assistant |
| `POST` | `/scan-receipt` | Upload & scan a PDF receipt |

### Admin — `/api/admin`
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/users` | Get all registered users |
| `PUT` | `/users/:id/role` | Promote or demote user role |
| `DELETE` | `/users/:id` | Delete a user |



## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


<div align="center">



</div>

> 
