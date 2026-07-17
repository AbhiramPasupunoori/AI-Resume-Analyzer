# AI Resume Analyzer

A Django REST Framework backend that extracts PDF/DOCX resume text, compares a
resume with a job description, and returns a frontend-ready score out of 100.

## Score breakdown

| Category | Maximum |
| --- | ---: |
| Job skill coverage | 45 |
| Semantic similarity | 25 |
| Resume sections | 15 |
| Measurable achievements | 10 |
| Readability | 5 |
| **Total** | **100** |

Analysis responses also include matched and missing skills, section details,
achievement/readability checks, and actionable recommendations.

## Backend setup

Requirements: Python 3.12+, Docker, and Docker Compose.

```bash
git clone <repository-url>
cd AI-Resume-Analyzer
cp backend/.env.example backend/.env
docker compose up -d

cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API runs at `http://127.0.0.1:8000/`. The root redirects to the health
endpoint. PostgreSQL is exposed on port `5432` by `docker-compose.yml`.

## Environment variables

Configure `backend/.env`:

```dotenv
DJANGO_SECRET_KEY=replace-with-a-secret-value
DJANGO_DEBUG=True
DATABASE_NAME=resume_analyzer
DATABASE_USER=resume_user
DATABASE_PASSWORD=resume_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
FRONTEND_URL=http://localhost:5173
SENTENCE_TRANSFORMER_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

The database values above match the included Docker Compose configuration.
Set `DJANGO_DEBUG=False`, use a strong secret, and configure allowed hosts when
deploying.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health/` | Application health |
| GET | `/api/health/database/` | Database health |
| POST | `/api/resumes/upload/` | Upload and extract a PDF/DOCX resume |
| GET | `/api/resumes/` | List uploaded resumes |
| GET, DELETE | `/api/resumes/<id>/` | View or delete a resume and its file |
| GET, POST | `/api/job-descriptions/` | List or create job descriptions |
| GET, DELETE | `/api/job-descriptions/<id>/` | View or delete a job description |
| GET, POST | `/api/analyses/` | List analyses or run an analysis |
| GET, DELETE | `/api/analyses/<id>/` | View or delete an analysis |
| GET | `/admin/` | Django administration |

Create an analysis with IDs returned by the resume and job-description APIs:

```json
{
  "resume_id": 1,
  "job_description_id": 1
}
```

## Tests and checks

```bash
cd backend
source .venv/bin/activate
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py migrate
python manage.py test analyzer
```

The first semantic analysis downloads the configured Sentence Transformer
model. Tests mock semantic inference so they remain deterministic and offline.

## Project structure

```text
AI-Resume-Analyzer/
├── backend/
│   ├── analyzer/
│   │   ├── data/          # Canonical skill catalog
│   │   ├── migrations/    # Database schema history
│   │   ├── services/      # Extraction, scoring, and recommendations
│   │   └── tests/         # Backend test suite
│   ├── config/            # Django settings and root URLs
│   ├── media/             # Uploaded resumes (development)
│   ├── manage.py
│   └── requirements.txt
├── docker-compose.yml
└── README.md
```

Useful database commands:

```bash
docker compose ps
docker compose logs postgres
docker exec -it resume-analyzer-postgres psql -U resume_user -d resume_analyzer
```
