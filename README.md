# PlacementAI 🚀

PlacementAI is a production-ready, AI-Powered Placement Management Platform designed for Student resume auditing, Recruiter job matching, and Placement Officer campus statistics tracking.

Developed for Product Development Simulation competitions, it leverages generative intelligence (Gemini) to grade ATS relevance, predict candidate match ratings, and auto-compile mock interview questions.

---

## 🛠️ Technology Stack
* **Frontend:** Next.js 15 (App Router), JavaScript (ESM/JSX), Tailwind CSS, Lucide Icons
* **Backend:** Next.js Serverless API Route Handlers
* **Database:** MongoDB with Prisma ORM
* **Authentication:** NextAuth.js (Role-Based JWT Credentials Sessions)
* **AI Engine:** Google Gemini Pro API (`@google/generative-ai`)

---

## 📂 Project Architecture & Code Design
All critical functions, utility managers, and serverless handlers include detailed JSDoc documentation conforming to enterprise standards:
* **Prisma Schema:** [schema.prisma](file:///c:/Arnav/AI-Powered%20Placement_Management_System/prisma/schema.prisma) mapping models to MongoDB.
* **Prisma Helper Client:** [prisma.js](file:///c:/Arnav/AI-Powered%20Placement_Management_System/src/lib/prisma.js) database instance.
* **AI Gemini Service:** [gemini.js](file:///c:/Arnav/AI-Powered%20Placement_Management_System/src/lib/gemini.js) parsing resumes and matching jobs.
* **NextAuth Security Handler:** [auth.js](file:///c:/Arnav/AI-Powered%20Placement_Management_System/src/lib/auth.js) and [middleware.js](file:///c:/Arnav/AI-Powered%20Placement_Management_System/src/middleware.js) protecting dashboards.
* **Student Dashboard UI:** [StudentDashboard](file:///c:/Arnav/AI-Powered%20Placement_Management_System/src/app/student/dashboard/page.jsx).
* **Recruiter Dashboard UI:** [RecruiterDashboard](file:///c:/Arnav/AI-Powered%20Placement_Management_System/src/app/recruiter/dashboard/page.jsx).
* **Placement Officer Dashboard UI:** [PlacementOfficerDashboard](file:///c:/Arnav/AI-Powered%20Placement_Management_System/src/app/officer/dashboard/page.jsx).

---

## ⚙️ Setup & Installation

### 1. Configure Environment Variables
Create a `.env` file at the project root folder (or use the preloaded [.env](file:///c:/Arnav/AI-Powered%20Placement_Management_System/.env) file) containing:
```env
# MongoDB Connection String (Prisma requires Replica Sets or Atlas URIs for MongoDB)
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.mongodb.net/placement_ai"

# NextAuth Configurations
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="a_very_long_random_and_secure_secret_hash_key_12345"

# Google Gemini API Key
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
```
*(Note: If the `GEMINI_API_KEY` is omitted, the platform will automatically activate a high-fidelity local parser simulator, enabling 100% offline demonstration support).*

### 2. Install Project Dependencies
Run the package installations:
```bash
npm install
```

### 3. Generate Prisma client libraries
Compile client types mapping to MongoDB schemas:
```bash
npx prisma generate
```

### 4. Database Seeding (Sample Data)
To seed 20 Students, 10 Recruiters, 15 Jobs, Resumes, and Application linkings, execute:
```bash
npx prisma db seed
```
**Alternatively:** For zero-config local/Vercel setups, navigate to the web endpoint to seed the database instantly:
👉 `http://localhost:3000/api/admin/seed`

### 5. Launch the Local Dev Server
```bash
npm run dev
```
Open `http://localhost:3000` to review the SaaS landing experience.

---

## 🔑 Simulation Test Credentials
All accounts are seeded with the default password: **`password123`**

| Role | Email Login | Description |
| :--- | :--- | :--- |
| **Placement Officer** | `officer@placementai.com` | Access campus dashboards, department metrics, and logs. |
| **Recruiter** | `recruiter.google@placementai.com` | Create jobs, edit/delete details, and check AI student matching. |
| **Student** | `student.rahul.sharma@placementai.com` | Upload resumes, check ATS feedback, filter recommendations, and practice questions. |

---

*Architected & engineered by Arnav Garg. Version 1.0.0.*
