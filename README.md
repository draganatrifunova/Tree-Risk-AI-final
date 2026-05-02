# Tree Risk AI

Production-ready full-stack web app for tree risk assessment using deterministic and ML-based scoring.

## Stack
- Backend: Django, DRF, PostgreSQL, JWT, scikit-learn
- Frontend: React (Vite), TailwindCSS, Leaflet, Recharts
- Deployment: Railway-ready settings, Procfile, env templates

## Backend Setup
1. `cd backend`
2. `python -m venv .venv`
3. Activate env and run `pip install -r requirements.txt`
4. Configure `.env` from `.env.example`
5. Run:
   - `python manage.py makemigrations`
   - `python manage.py migrate`
   - `python manage.py createsuperuser`
6. Train ML model:
   - `python -m ai.risk_model`
7. Start API:
   - `python manage.py runserver`

## Frontend Setup
1. `cd frontend`
2. `npm install`
3. Configure `.env` from `.env.example`
4. `npm run dev`

## API Endpoints
- Auth: `POST /api/auth/register`, `POST /api/auth/login`
- Trees: `GET/POST /api/trees`, `PUT/DELETE /api/trees/{id}`
- Weather: `POST /api/weather`, `GET /api/weather`
- Risk: `POST /api/risk/calculate`, `GET /api/risk/history`
- Reports: `GET /api/reports/generate`
- AI: `POST /api/ai/detect-trees`

## Notes
- Role-based create/delete restrictions for tree and weather write actions.
- Risk score updates are tracked in `RiskHistory`.
- `ai/generate_dataset.py` creates synthetic data if missing or invalid.
