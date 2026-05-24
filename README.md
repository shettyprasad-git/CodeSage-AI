# CodeSage AI — Intelligent Pull Request Review Assistant

> “Your AI-Powered Senior Developer for Every Pull Request.”

CodeSage AI is a modern, full-stack AI SaaS platform designed to automate code auditing and pull request reviews. By integrating Google's Gemini API (with a Hugging Face fallback model and local static rule parser), developers can instantly detect bugs, security vulnerabilities, code smells, and performance bottlenecks, and get optimized drop-in code suggestion cards.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React + Vite
- **Styling**: Tailwind CSS v4 (CSS-first, custom utility glows, and variables)
- **Animations**: Framer Motion (slide drawers, fade transitions, and scaling modals)
- **Editor**: Monaco Editor (`@monaco-editor/react`) for full VSCode dark theme code manipulation
- **Charts**: Recharts (Area, Bar, and Donut Pie visualization widgets)
- **Icons**: Lucide React

### Backend
- **Framework**: Node.js + Express.js
- **Database**: MongoDB (Mongoose schemas for users, reviews, repos, settings)
- **Security**: JWT session authentication & bcryptjs password hashing
- **Connectors**: Axios for GitHub API integrations and Hugging Face queries

### AI Orchestrator
- **Primary Model**: Gemini 1.5 Flash (via `@google/generative-ai`)
- **Secondary Model (Fallback)**: `Qwen/Qwen2.5-Coder-7B-Instruct` (via Hugging Face API)
- **Static Rules Engine (Local Fallback)**: RegEx-based static analyzer for offline/zero-key diagnostics

---

## 📁 Repository Structure

```
CodeSage AI/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connectivity using Mongoose
│   │   ├── controllers/     # Authentication, Review audits, Repo, Analytics
│   │   ├── middleware/      # Protected JWT token routes & error capturing
│   │   ├── models/          # Mongoose collections (User, Review, Repo, Settings)
│   │   ├── routes/          # Express API route mapping
│   │   ├── utils/           # AI Core engine and GitHub API connector
│   │   └── index.js         # Backend entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # UI Layout shell, sidebar, custom toasts & skeletons
│   │   ├── context/         # AuthProvider & settings updater
│   │   ├── pages/           # Landing page, Login, Signup, Dashboard, Workspace, Charts, Settings
│   │   ├── App.jsx          # React Router mappings
│   │   ├── index.css        # Tailwind v4 import & custom glassmorphism styles
│   │   └── main.jsx         # React root mount
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js       # Vite configuration with Tailwind and Backend API Proxying
├── shared/
│   └── constants.js         # Shared severity levels, issue types, and verdicts
└── README.md
```

---

## 🛠️ Local Setup Guide

### Prerequisites
- Node.js (version 18 or higher)
- A MongoDB database (MongoDB Atlas connection string recommended)
- A Gemini API key (optional for local static scanning, required for full AI functionality)

### 1. Configure Environment Variables
Copy the env templates inside both folders:

**Backend Setup:**
Create `backend/.env` containing:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/codesage?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
HF_API_KEY=your_huggingface_token_here
```

**Frontend Setup:**
Create `frontend/.env` containing:
```env
VITE_API_URL=http://localhost:5000
```

### 2. Install Dependencies & Run

**Start Express Server:**
```bash
cd backend
npm install
npm start
```
The server will boot and connect to MongoDB Atlas, listening on `http://localhost:5000`.

**Start Vite Client:**
```bash
cd ../frontend
npm install
npm run dev
```
The application will launch on `http://localhost:3000` with hot module reloading (HMR).

---

## 🎯 Core Workflows

1. **User Authentication**:
   - Register user settings. Custom API keys and GitHub tokens are encrypted/masked and stored in Mongoose settings schemas.

2. **Repository Sync**:
   - Paste a GitHub URL to import repository metadata (stars, open issues, forks) and retrieve simulated file lists ready for file-specific audits.

3. **Workspace Review**:
   - Switch between code-pasting, file uploading, repository parsing, or PR diff analysis.
   - Run AI reviews to generate a visual report card, complete with a total code quality score, severity tags (Critical, High, Medium, Low), line warnings, and suggested code corrections.
   - Click any warning card to automatically focus and scroll the Monaco editor window to the target line of interest.

4. **AI Debugger Chat**:
   - Tap the Chat toggle to raise clarifying questions about the review. The AI assistant has access to the audited file context and warning outputs.

5. **Analytics**:
   - Interactive Recharts graphs show security splits (donut pie), quality trends (gradient area), issue category volume (bars), and weekly commit/review levels.
