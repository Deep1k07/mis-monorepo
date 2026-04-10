# Running with Docker

The whole stack — MongoDB, NestJS backend, and Next.js web — runs from one command.

## Prerequisites

- Docker Desktop (or Docker Engine + Compose plugin)

## First-time setup

1. Copy the env example to `.env` in the repo root and fill in any secrets:
   ```sh
   cp .env.docker.example .env
   ```
   At minimum, set `JWT_SECRET`. `RESEND_API_KEY` is only needed if you want
   email/OTP features to actually send mail.

2. Build and start everything:
   ```sh
   docker compose up --build
   ```

   This brings up three containers:
   | Service  | Image / Build | Port | Notes |
   |---|---|---|---|
   | `mongodb` | `mongo:7` | `27017` | Persists to the `mis-mongo-data` volume |
   | `backend` | `apps/backend/Dockerfile` | `3003` | NestJS, includes Chromium for Puppeteer |
   | `web`     | `apps/web/Dockerfile` | `3002` | Next.js standalone build |

3. Open the app: <http://localhost:3002>
   API docs: <http://localhost:3003/api-docs>

## Common commands

```sh
# Start in the background
docker compose up -d --build

# Tail logs
docker compose logs -f backend
docker compose logs -f web

# Stop everything
docker compose down

# Stop and wipe the DB volume (full reset)
docker compose down -v

# Rebuild only one service
docker compose build backend
docker compose up -d backend

# Open a shell in a running container
docker compose exec backend sh
docker compose exec mongodb mongosh mis
```

## Seeding permissions

After the first run, seed the default permissions inside the backend container:

```sh
docker compose exec backend node dist/permission/seed-permissions.js
```

## How env vars flow

- **Backend** reads env vars at runtime from compose. Edit `.env` in the repo
  root and `docker compose up` again — no rebuild needed.
- **Web** bakes `NEXT_PUBLIC_BACKEND_URL` into the client bundle at *build*
  time. If you change it, rebuild:
  ```sh
  docker compose build web
  ```
  For production, point it at your real API:
  ```sh
  NEXT_PUBLIC_BACKEND_URL=https://api.example.com docker compose build web
  ```

## Volumes

| Volume | Purpose |
|---|---|
| `mis-mongo-data` | MongoDB data files |
| `mis-backend-certs` | Generated certificate PDFs (`apps/backend/generated-certificates`) |

Wipe with `docker compose down -v`.

## Troubleshooting

**Backend can't connect to MongoDB** — `MONGO_URI` inside the backend
container must point to `mongodb://mongodb:27017/mis` (the service name on the
docker network). It does by default.

**Web shows CORS errors hitting the backend** — verify `CLIENT_URL` in your
`.env` matches the URL you're loading the web app from (default
`http://localhost:3002`).

**Puppeteer can't find Chrome** — the runner stage installs system Chromium and
sets `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`. If you change the base
image, make sure these are still in place.
