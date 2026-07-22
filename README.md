# AI Resume Analyzer

A single-repository React application deployed as one Vercel project. There is
no Django backend and no database. Vercel JavaScript Functions provide the API
and save records as JSON files in this same GitHub repository.

## Repository layout

```text
frontend/
  api/                 Vercel API function
  src/                 React application
  vercel.json          SPA and function configuration
data/                   JSON storage location
```

The API creates these files when they are first needed:

```text
data/resumes.json
data/job-descriptions.json
data/analyses.json
data/built-resumes.json
```

PDF and DOCX files are parsed inside the Vercel function. The original binary
is discarded; extracted text and metadata are stored in `data/resumes.json`.

## GitHub token configuration

Create a fine-grained GitHub personal access token restricted to this
repository, with repository permission **Contents: Read and write**.

Add these variables under Vercel → Project Settings → Environment Variables:

```env
GITHUB_TOKEN=github_pat_...
GITHUB_REPOSITORY=owner/AI-Resume-Analyzer
GITHUB_BRANCH=main
GITHUB_DATA_PATH=data
```

Important:

- `GITHUB_TOKEN` is used only by the server-side Vercel Function. Never name it
  `VITE_GITHUB_TOKEN`, because `VITE_*` values are bundled into browser code.
- The target branch must exist and allow the token owner to commit.
- Resume text remains in Git history even after a JSON record is deleted.
  Do not use a public repository for real resumes.
- Since data is committed to the application repository, GitHub may notify
  Vercel after every write. Commit messages include `[skip vercel]`, but configure
  Vercel's Ignored Build Step if your Git integration still starts data-only
  deployments.

## Vercel deployment

Import this GitHub repository as one Vercel project and set its **Root
Directory** to `frontend`. The included `vercel.json` serves React routes and
the catch-all `/api/*` JavaScript Function.

No `VITE_API_BASE_URL` is required in production because the frontend and API
share the same origin.

## Local development

Requirements: Node.js 22.12+.

```bash
npm run install:frontend
npm run dev
```

Vite runs both the frontend and a local adapter for the Vercel API function.
During local development, records are written directly to `data/*.json`; no
GitHub token is required. On Vercel, the API commits those files through GitHub.

## API storage behavior

- Each collection is a JSON array with numeric IDs and timestamps.
- Writes use GitHub's current blob SHA and retry concurrent-write conflicts up
  to three times.
- GitHub failures return HTTP 503 and validation failures return HTTP 400.
- Git-backed JSON is appropriate for a personal/demo project with light
  traffic, not high-volume or highly concurrent usage.

## Build

```bash
npm run build
```
