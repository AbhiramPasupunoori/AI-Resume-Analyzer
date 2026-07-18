# AI Resume Analyzer

AI Resume Analyzer is a full-stack web application that compares a PDF or DOCX resume with a job description. It produces an ATS-style score, matched and missing skills, section and achievement checks, readability feedback, and actionable recommendations.

## Features

- Upload PDF and DOCX resumes
- Extract and inspect resume text
- Create and save job descriptions
- Detect skills in resumes and job descriptions
- Show matched and missing skills
- Calculate a weighted score out of 100
- Compare text using Sentence Transformers
- Detect important resume sections and measurable achievements
- Evaluate readability
- Generate improvement recommendations
- Display score breakdowns using charts
- View previous analyses
- Delete analyses, resumes, job descriptions, and stored resume files

## Tech Stack

### Backend

- Python 3.12+
- Django 6 and Django REST Framework
- PostgreSQL 17
- Docker and Docker Compose
- Psycopg
- PyMuPDF and python-docx
- spaCy
- Sentence Transformers, PyTorch, and scikit-learn

### Frontend

- React 19
- Vite 8
- Axios
- React Router
- Recharts
- CSS

## Project Structure

```text
AI-Resume-Analyzer/
├── backend/
│   ├── analyzer/
│   │   ├── data/          # Skill catalog
│   │   ├── migrations/    # Database migrations
│   │   ├── services/      # Extraction and scoring logic
│   │   ├── tests/         # Backend test suite
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── config/            # Django settings and root URLs
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── utils/
│   ├── package.json
│   └── package-lock.json
├── docker-compose.yml
├── README.md
└── .gitignore
```

## Prerequisites

Install the following software before starting:

- Git
- Python 3.12 or newer
- Node.js 20.19+ or 22.12+ and npm
- Docker Desktop, including Docker Compose

Verify the installations:

```bash
git --version
python3 --version
node --version
npm --version
docker --version
docker compose version
```

On macOS, Docker Desktop can be installed and opened with:

```bash
brew install --cask docker
open -a Docker
```

Wait until Docker Desktop reports that its engine is running before continuing.

### Optional VS Code extensions

- Python by Microsoft
- Pylance by Microsoft
- ESLint by Microsoft
- Docker by Microsoft
- PostgreSQL by Microsoft

The extensions are helpful but are not required to run the application.

## Quick Start (Local)

For a fresh clone, run these commands from start to finish:

```bash
git clone <repository-url>
cd AI-Resume-Analyzer

# Start PostgreSQL
docker compose up -d

# Set up and start the backend
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The backend now runs at <http://127.0.0.1:8000/>. Keep it running, open a second terminal, and start the frontend:

```bash
cd AI-Resume-Analyzer/frontend
npm install
printf 'VITE_API_BASE_URL=http://127.0.0.1:8000/api\n' > .env
npm run dev
```

Open <http://localhost:5173/>. The detailed steps and environment configuration are explained below.

### 1. Start PostgreSQL

The included Compose file creates PostgreSQL with the database name, user, and password expected by the sample backend environment.

```bash
docker compose up -d
docker compose ps
```

Wait until `resume-analyzer-postgres` is shown as healthy. To inspect startup logs:

```bash
docker compose logs -f postgres
```

Press `Ctrl+C` to leave the log viewer; the database continues running.

### 2. Set up the backend

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
```

On Windows PowerShell, activate the environment with:

```powershell
.venv\Scripts\Activate.ps1
```

The generated `backend/.env` should contain:

```dotenv
DJANGO_SECRET_KEY=django-development-secret-key-change-before-production
DJANGO_DEBUG=True

DATABASE_NAME=resume_analyzer
DATABASE_USER=resume_user
DATABASE_PASSWORD=resume_password
DATABASE_HOST=localhost
DATABASE_PORT=5432

FRONTEND_URL=http://localhost:5173
SENTENCE_TRANSFORMER_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

Apply the committed database migrations and optionally create an administrator:

```bash
python manage.py migrate
python manage.py createsuperuser
```

`createsuperuser` is optional and is only needed for Django Admin.

Start the backend:

```bash
python manage.py runserver
```

Backend URLs:

- API root/health redirect: <http://127.0.0.1:8000/>
- Health check: <http://127.0.0.1:8000/api/health/>
- Database health: <http://127.0.0.1:8000/api/health/database/>
- Django Admin: <http://127.0.0.1:8000/admin/>

### 3. Set up the frontend

Keep the backend running and open a second terminal:

```bash
cd AI-Resume-Analyzer/frontend
npm install
```

Create `frontend/.env`:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Start the frontend:

```bash
npm run dev
```

Open <http://localhost:5173/>.

The Sentence Transformer model is downloaded automatically the first time semantic analysis runs. The initial analysis can therefore take longer and requires an internet connection.

## Database Setup and Management

The default local database is PostgreSQL 17 in Docker. Its configuration is:

| Setting | Value |
| --- | --- |
| Container | `resume-analyzer-postgres` |
| Database | `resume_analyzer` |
| User | `resume_user` |
| Password | `resume_password` |
| Host | `localhost` |
| Port | `5432` |

Useful commands, run from the project root:

```bash
# Start or recreate the service
docker compose up -d

# Check its status
docker compose ps

# View PostgreSQL logs
docker compose logs postgres

# Open psql inside the container
docker exec -it resume-analyzer-postgres psql -U resume_user -d resume_analyzer

# Stop containers without deleting database data
docker compose down
```

To start the existing database again later:

```bash
docker compose up -d
```

Do not run `docker compose down -v` unless you intentionally want to permanently remove the local database volume.

### Database migrations

After pulling changes, activate the backend environment and apply migrations:

```bash
cd backend
source .venv/bin/activate
python manage.py migrate
```

When changing Django models during development:

```bash
python manage.py makemigrations analyzer
python manage.py migrate
```

Do not create new migrations during ordinary installation; new users only need `python manage.py migrate`.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health/` | Application health |
| GET | `/api/health/database/` | PostgreSQL health |
| GET | `/api/resumes/` | List resumes |
| POST | `/api/resumes/upload/` | Upload and extract a PDF/DOCX resume |
| GET | `/api/resumes/<id>/` | Retrieve a resume |
| DELETE | `/api/resumes/<id>/` | Delete a resume and its uploaded file |
| GET | `/api/job-descriptions/` | List job descriptions |
| POST | `/api/job-descriptions/` | Create a job description |
| GET | `/api/job-descriptions/<id>/` | Retrieve a job description |
| DELETE | `/api/job-descriptions/<id>/` | Delete a job description |
| GET | `/api/analyses/` | List analyses |
| POST | `/api/analyses/` | Run an analysis |
| GET | `/api/analyses/<id>/` | Retrieve an analysis |
| DELETE | `/api/analyses/<id>/` | Delete an analysis |

Create an analysis using IDs returned by the resume and job-description endpoints:

```json
{
  "resume_id": 1,
  "job_description_id": 1
}
```

## Scoring System

| Category | Points |
| --- | ---: |
| Job skill coverage | 45 |
| Semantic similarity | 25 |
| Resume sections | 15 |
| Measurable achievements | 10 |
| Readability | 5 |
| **Total** | **100** |

## Tests and Build Verification

Run backend checks, verify that model changes do not need a migration, apply migrations, and run all analyzer tests:

```bash
cd backend
source .venv/bin/activate
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py migrate
python manage.py test analyzer
```

Run the frontend checks and production build:

```bash
cd frontend
npm run lint
npm run build
```

The production frontend output is written to `frontend/dist/` and is ignored by Git.

## Running the Project Later

From the project root:

```bash
docker compose up -d
```

Terminal 1:

```bash
cd backend
source .venv/bin/activate
python manage.py migrate
python manage.py runserver
```

Terminal 2:

```bash
cd frontend
npm run dev
```

## Troubleshooting

### PostgreSQL connection refused

Make sure Docker Desktop is open and the PostgreSQL container is healthy:

```bash
open -a Docker
docker compose up -d
docker compose ps
docker compose logs postgres
```

Also confirm that the database values in `backend/.env` match `docker-compose.yml`.

### Port already in use

The backend, frontend, and database use ports 8000, 5173, and 5432 respectively. Stop the conflicting service or change the relevant configuration.

### Node.js version warning

Vite 8 requires Node.js 20.19+ or 22.12+. Upgrade Node before running the frontend build. With `nvm`:

```bash
nvm install 22
nvm use 22
```

### Semantic model download

The first analysis downloads the configured Hugging Face model. Confirm that the device has internet access and enough free disk space.

## Security Notes

- Never commit `.env` files, secrets, virtual environments, `node_modules`, generated builds, or uploaded resumes.
- Use a strong `DJANGO_SECRET_KEY` and set `DJANGO_DEBUG=False` in production.
- The credentials in `docker-compose.yml` are intended only for local development.
- Configure production hosts, HTTPS, persistent media storage, and production database credentials before deployment.
