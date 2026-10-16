# CloudLogin — AWS learning project

React + Express + MongoDB Atlas login app. It includes registration, password hashing with bcrypt, JWT login, and a protected `/api/auth/me` endpoint.

## 1. Backend setup

From PowerShell inside the project directory:

```powershell
cd backend
npm install
Copy-Item .env.example .env
# Edit .env with your MongoDB Atlas URI and at least 32-character JWT_SECRET
npm run dev
```

Check `http://localhost:5000/` or `http://localhost:5000/health`.

## 2. Frontend setup

In another PowerShell terminal inside the project directory:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

## 3. API endpoints

- `GET /` — API status
- `GET /health` — health check
- `POST /api/auth/register` — `{ "name": "...", "email": "...", "password": "..." }`
- `POST /api/auth/login` — `{ "email": "...", "password": "..." }`
- `GET /api/auth/me` — requires `Authorization: Bearer <token>`

## 4. Deployment learning map

- EC2: run the Express API.
- VPC: understand subnets and restrict network access; keep databases private when applicable.
- S3: later add secure profile-picture uploads (private bucket and presigned URLs).
- CloudFront: serve the production React build from an S3 origin.
- RDS: separate MySQL practice exercise. This app uses MongoDB Atlas, not RDS.

## Security notes

This is a learning starter, not a production-ready auth system. Add rate limiting, HTTPS, a deliberate secure token-storage strategy, robust validation, and monitoring before production. The example keeps the JWT in React memory rather than localStorage; refreshing the page signs the user out. Never commit `.env` or credentials.
