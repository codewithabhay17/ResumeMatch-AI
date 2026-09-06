# ResuMatch AI — Final Setup & Deployment Guide

## 1. Requirements
- Node.js 20+ recommended
- PostgreSQL 14+
- Gemini API key for AI analysis/matching

## 2. Backend
```bash
cd backend
npm install
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
```
Edit `.env` and set:
- `DATABASE_URL`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional)
- `CLIENT_URL` (optional; defaults to http://localhost:5173)

Create the database, then run:
```bash
psql -d resume_analyzer -f src/config/schema.sql
npm run dev
```
Health check: `http://localhost:5000/api/health`

## 3. Frontend
Open a second terminal:
```bash
cd frontend
npm install
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
npm run dev
```
The frontend defaults to `http://localhost:5000/api`.

## 4. Main user flow
1. Register / Login
2. Upload a PDF/TXT resume
3. Open Resume Analysis
4. Run AI analysis
5. Browse Jobs
6. Calculate a job match
7. Open the Match Audit Report
8. Apply or mark the match as applied

## 5. Production checklist
- Set a strong random `JWT_SECRET`.
- Use a managed PostgreSQL database.
- Set `NODE_ENV=production`.
- Set `CLIENT_URL` to the deployed frontend origin.
- Set `VITE_API_URL` to the deployed backend `/api` URL before building the frontend.
- Keep `.env` files and API keys out of Git.
- Put HTTPS in front of both services.
- Restrict CORS to the production frontend origin.
- Store uploads in durable object storage for production rather than local disk.
- Configure database backups and monitoring.

## 6. Production frontend build
```bash
cd frontend
npm install
npm run build
npm run preview
```
The build output is generated in `frontend/dist`.

## 7. Validation
Run backend syntax validation with:
```bash
cd backend
for %f in (src\*.js src\controllers\*.js src\routes\*.js src\services\*.js src\middlewares\*.js src\utils\*.js) do node --check "%f"
```
On macOS/Linux, use `find src -name "*.js" -print0 | xargs -0 -n1 node --check`.

Note: dependency installation and the full Vite build should be run on the developer machine or CI environment; the provided environment may time out during npm downloads.
