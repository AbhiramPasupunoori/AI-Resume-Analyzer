# AI Resume Analyzer

Full-stack resume analysis application built with Django REST Framework, React, and PostgreSQL.

## Features

- Upload PDF and DOCX resumes (maximum 5 MB)
- Build and save resumes with a live preview
- Download built resumes as PDF files
- Analyze a built resume directly against a job description
- Extract resume text and detect skills
- Create and save job descriptions
- Show matched and missing skills
- Calculate an ATS-style score out of 100
- Measure semantic similarity, section completeness, achievements, and readability
- Generate resume improvement recommendations
- Display results with charts
- View analysis history
- Delete resumes, job descriptions, and analyses
- Run React and Django separately during development
- Serve the built React application through Django as one merged application

## Tech Stack

### Backend

- Python 3.12+
- Django 6
- Django REST Framework
- PostgreSQL 17
- Docker and Docker Compose
- PyMuPDF and python-docx
- spaCy and Sentence Transformers

### Frontend

- React 19
- Vite 8
- Axios
- React Router
- Recharts
- jsPDF
- CSS

## Required Software

- Git
- Python 3.12 or newer
- Node.js 20.19+ or 22.12+
- npm
- Docker Desktop

Check the installed versions:

```bash
git --version
python3 --version
node --version
npm --version
docker --version
docker compose version
```

Optional VS Code extensions:

- Python
- Pylance
- Docker
- PostgreSQL
- ESLint

## Install Required Software

### macOS (Homebrew)

Install Homebrew from <https://brew.sh/> if `brew` is unavailable, then run:

```bash
brew install git python@3.12 node@22
brew install --cask docker
open -a Docker
```

Wait until Docker Desktop displays **Engine running**, then verify everything:

```bash
git --version
python3.12 --version
node --version
npm --version
docker --version
docker compose version
docker info
```

Official Docker instructions: <https://docs.docker.com/desktop/setup/install/mac-install/>.

### Windows (PowerShell)

```powershell
winget install --id Git.Git -e
winget install --id Python.Python.3.12 -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Docker.DockerDesktop -e
```

Restart PowerShell, open Docker Desktop, and verify:

```powershell
git --version
python --version
node --version
npm --version
docker --version
docker compose version
```

Official Docker instructions: <https://docs.docker.com/desktop/setup/install/windows-install/>.

### Ubuntu 24.04

```bash
sudo apt update
sudo apt install -y git python3.12 python3.12-venv python3-pip ca-certificates curl
```

Install Node.js 22 from <https://nodejs.org/en/download>. Install Docker Engine and the Compose plugin using the official Ubuntu instructions at <https://docs.docker.com/engine/install/ubuntu/>. Then run:

```bash
sudo systemctl enable --now docker
sudo docker run hello-world
docker compose version
```

Docker Desktop includes Docker Compose on macOS and Windows. You do not need to install PostgreSQL separately because this project runs PostgreSQL 17 in Docker.

## First-Time Setup (Merged Application)

Clone the project:

```bash
git clone <repository-url>
cd AI-Resume-Analyzer
```

From the project root, start Docker Desktop and PostgreSQL:

```bash
open -a Docker  # macOS only; wait until Docker reports that it is running
docker compose up -d
docker compose ps
```

Set up the backend:

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
```

Do not run `cd backend` if the terminal prompt already ends with `backend %`.

On Windows PowerShell, activate the environment with:

```powershell
.venv\Scripts\Activate.ps1
```

Install and build the frontend into Django:

```bash
cd ../frontend
npm install
npm run build

cd ../backend
python manage.py runserver
```

Keep this terminal open and visit <http://127.0.0.1:8000/>. Press `Control-C`
to stop the server.

## Environment Variables

Create `backend/.env`:

```env
DJANGO_SECRET_KEY=django-development-secret-key-change-later
DJANGO_DEBUG=True

DATABASE_NAME=resume_analyzer
DATABASE_USER=resume_user
DATABASE_PASSWORD=resume_password
DATABASE_HOST=localhost
DATABASE_PORT=5432

FRONTEND_URL=http://localhost:5173
SENTENCE_TRANSFORMER_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=/api
```

Never commit `.env`, `.venv`, `node_modules`, or uploaded resume files.

## Database Setup

The included `docker-compose.yml` creates the required PostgreSQL database:

```text
Database: resume_analyzer
User:     resume_user
Password: resume_password
Host:     localhost
Port:     5432
```

Useful database commands:

```bash
# Run these commands from the project root.

# Download the image and start PostgreSQL
docker compose pull
docker compose up -d

# Check container and database health
docker compose ps
docker inspect --format='{{json .State.Health.Status}}' resume-analyzer-postgres

# Follow logs (Ctrl+C closes the viewer, not PostgreSQL)
docker compose logs -f postgres

# Verify that PostgreSQL accepts connections
docker exec resume-analyzer-postgres pg_isready -U resume_user -d resume_analyzer

# Open PostgreSQL terminal
docker exec -it resume-analyzer-postgres psql -U resume_user -d resume_analyzer

# List databases and application tables
docker exec -it resume-analyzer-postgres psql -U resume_user -d resume_analyzer -c '\l'
docker exec -it resume-analyzer-postgres psql -U resume_user -d resume_analyzer -c '\dt'

# Restart, stop, or start only PostgreSQL
docker compose restart postgres
docker compose stop postgres
docker compose start postgres

# Remove containers without deleting database data
docker compose down
```

Apply migrations after PostgreSQL is healthy:

```bash
cd backend
source .venv/bin/activate
python manage.py check
python manage.py showmigrations
python manage.py migrate
```

Back up the database from the project root:

```bash
docker exec resume-analyzer-postgres pg_dump -U resume_user -d resume_analyzer > resume_analyzer_backup.sql
```

Restore a backup:

```bash
docker exec -i resume-analyzer-postgres psql -U resume_user -d resume_analyzer < resume_analyzer_backup.sql
```

Do not run this unless you intentionally want to delete all local database data:

```bash
docker compose down -v
```

## Database Migrations

```bash
cd backend
source .venv/bin/activate
python manage.py makemigrations
python manage.py migrate
```

After cloning or pulling existing migrations, normally only this is required:

```bash
python manage.py migrate
```

## Development Mode (Separate Servers)

Use this mode while changing React or Django code.

Terminal 1 — Django backend:

```bash
cd AI-Resume-Analyzer/backend
source .venv/bin/activate
python manage.py migrate
python manage.py runserver
```

Terminal 2 — React frontend:

```bash
cd AI-Resume-Analyzer/frontend
npm run dev
```

Open:

```text
React frontend: http://localhost:5173/
Resume Builder: http://localhost:5173/resume-builder
Django API:     http://127.0.0.1:8000/api/
```

Vite automatically forwards `/api` and `/media` requests to Django.

## Merged Application (One Server)

### Everyday startup (including after reopening VS Code)

Closing VS Code stops Django. A newly opened terminal also does not retain its
previous directory or activated virtual environment. Run these commands from
any terminal:

```bash
cd "/Users/abhiram/Documents/GitHub/AI-Resume-Analyzer"
open -a Docker
docker compose up -d
cd backend
source .venv/bin/activate
python manage.py migrate
python manage.py runserver
```

Keep the terminal open while using the application. Open
<http://127.0.0.1:8000/> and press `Control-C` when you want to stop Django.

You can start Django without activating the virtual environment by running this
from the project root:

```bash
docker compose up -d
backend/.venv/bin/python backend/manage.py migrate
backend/.venv/bin/python backend/manage.py runserver
```

### After changing frontend code

Rebuild React so Django serves the latest frontend:

```bash
cd "/Users/abhiram/Documents/GitHub/AI-Resume-Analyzer/frontend"
npm install
npm run build

cd ../backend
source .venv/bin/activate
python manage.py runserver
```

The React build is written to `backend/static/frontend/`. You do not need to
run the Vite development server for the merged application.

Open:

```text
Application:     http://127.0.0.1:8000/
Analyze:         http://127.0.0.1:8000/analyze
Resume Builder:  http://127.0.0.1:8000/resume-builder
History:         http://127.0.0.1:8000/history
Health check:    http://127.0.0.1:8000/api/health/
Database health: http://127.0.0.1:8000/api/health/database/
Admin:           http://127.0.0.1:8000/admin/
```

## Run Tests

Backend:

```bash
cd backend
source .venv/bin/activate
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test analyzer
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Notes

- Docker Desktop must be running before Django connects to PostgreSQL.
- Run `python manage.py runserver` from `backend`, where `manage.py` is located.
- Do not recreate `.venv` or reinstall dependencies during normal daily startup.
- Do not commit `backend/.env`; it contains machine-specific settings and secrets.
- The first analysis downloads the Sentence Transformer model and may take longer.
- Use `DJANGO_DEBUG=False` and secure credentials in production.
- Uploaded resumes are stored in `backend/media/` during local development.
