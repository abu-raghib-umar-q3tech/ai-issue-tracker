# MERN Issue Tracker Base

Clean architecture starter with:

- Frontend: React (Vite), Tailwind CSS, Redux Toolkit, RTK Query, TypeScript
- Backend: Node.js, Express, MongoDB (Mongoose), TypeScript

## Project Structure

```text
/frontend
/backend
```

## Backend Setup (TypeScript)

1. Go to backend:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create env file:

   ```bash
   cp .env.example .env
   ```

4. Start development server:

   ```bash
   npm run dev
   ```

Backend default: `http://localhost:5001`

### Backend Scripts

- `npm run dev`: Run backend in watch mode using `tsx`
- `npm run typecheck`: Run TypeScript checks with no emit
- `npm run build`: Compile TypeScript to `backend/dist`
- `npm start`: Run compiled server from `dist/server.js`

Note: `nodemon` is not required in this setup because `tsx watch` already provides auto-reload during development.

## Frontend Setup

1. Go to frontend:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create env file:

   ```bash
   cp .env.example .env
   ```

4. Run app:

   ```bash
   npm run dev
   ```

Frontend default: `http://localhost:5173`

## MongoDB Troubleshooting

If backend shows `ECONNREFUSED 127.0.0.1:27017`, MongoDB is not running locally.

Options:

1. Install and start MongoDB Community Server locally, then keep:
   `MONGO_URI=mongodb://127.0.0.1:27017/issue_tracker`
2. Use MongoDB Atlas and set `MONGO_URI` in `backend/.env` to your Atlas connection string.

## API Endpoints

- `GET /api/health`
- `GET /api/issues`
- `GET /api/issues/:id`
- `POST /api/issues`
- `PATCH /api/issues/:id`
- `DELETE /api/issues/:id`

