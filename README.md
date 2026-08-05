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
data/users.json
data/auth-events.json
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
AUTH_SECRET=a-random-secret-with-at-least-32-characters
ADMIN_EMAILS=your-admin-email@example.com
```

Important:

- `GITHUB_TOKEN` is used only by the server-side Vercel Function. Never name it
  `VITE_GITHUB_TOKEN`, because `VITE_*` values are bundled into browser code.
- The target branch must exist and allow the token owner to commit.
- Resume text remains in Git history even after a JSON record is deleted.
  Do not use a public repository for real resumes.
- Registered users are stored with salted `scrypt` password hashes. The data
  repository must be private; a public repository would expose password hashes
  to offline attacks. For a public or higher-traffic application, replace the
  GitHub JSON store with a managed authentication service and database.
- `AUTH_SECRET` signs the HTTP-only login cookie. Generate a unique random value,
  keep it only in Vercel, and never use a `VITE_` prefix.
- `ADMIN_EMAILS` is a comma-separated allowlist. Only accounts whose normalized
  email appears in this server-side value receive administrator privileges.
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

After adding or changing `AUTH_SECRET`, redeploy the project. Existing sessions
become invalid whenever this value changes, which is expected.

## Local development

Requirements: Node.js 22.12+.

```bash
npm run install:frontend
npm run dev
```

Vite runs both the frontend and a local adapter for the Vercel API function.
During local development, records are written directly to `data/*.json`; no
GitHub token is required. On Vercel, the API commits those files through GitHub.
Local development supplies a development-only session secret automatically.

## Authentication

- Registration requires a name, valid email, and a password containing at
  least eight characters in any combination.
- Passwords are salted and hashed with Node.js `scrypt`; plaintext passwords
  are never stored.
- Login sessions use signed, HTTP-only, `SameSite=Lax` cookies. Production
  cookies are also marked `Secure` and expire after seven days.
- Dashboard, analysis, results, history, and all resume-builder routes require
  login. API records are assigned to the current user and filtered by owner.
- Browser-saved builder drafts, template choices, progress, and edited-resume
  history are namespaced by user so accounts sharing one device remain isolated.

## Administrator account

1. Register the intended administrator account before sharing the deployment.
2. Add its exact email to the Vercel Production variable `ADMIN_EMAILS`. Multiple
   administrator emails can be separated with commas.
3. Redeploy, then log out and back in so the refreshed account response includes
   administrator status.
4. Open the profile dropdown and select **Admin Dashboard**.

The administrator dashboard can view registered user identity, resume and
analysis history, and successful registration/login/logout records. Passwords
are never visible. An administrator can set a new password of at least eight
characters; doing so invalidates that user's existing sessions. Admin access is
checked by the server for every request, so hiding or manually opening the route
cannot bypass authorization.

Register the administrator account before publishing the link because this app
does not currently verify email ownership. Treat `ADMIN_EMAILS` and
`AUTH_SECRET` as production secrets and keep the GitHub data repository private.

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
