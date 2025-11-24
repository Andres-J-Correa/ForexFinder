# Docker Setup Guide

This project uses Docker Compose with profiles to manage development and production environments.

## Files
- `docker-compose.yml`: Main Compose file defining services and profiles.
- `Dockerfile.dev`: Development image with hot-reload.
- `Dockerfile.prod`: Multi-stage production image (optimized).
- `.github/workflows/deploy.yml`: CI/CD pipeline for VPS deployment.

## Prerequisites
- Docker and Docker Compose installed.
- `.env.development` file for local development.
- `.env` file for production (created automatically by CI/CD or manually).

## How to Run

### Development
To start the application in development mode with hot-reload:
```bash
docker compose --profile dev up --build
```
- Mounts local source code to the container.
- Changes in `src/` will trigger a rebuild/restart inside the container.
- Access at `http://localhost:3000`.

### Production
To test the production build locally:
```bash
docker compose --profile prod up --build
```
- Builds the optimized image.
- Does NOT mount source code (uses the built image).
- Access at `http://localhost:3000`.

## Deployment (GitHub Actions)

The workflow in `.github/workflows/deploy.yml` automates deployment to your VPS.

### Setup Steps:
1. **VPS Preparation**:
   - Ensure Docker and Docker Compose are installed on your VPS.
   - Clone the repository to your VPS (e.g., `~/ForexFinder/server`).
   - Ensure the path in `deploy.yml` matches your VPS path.

2. **GitHub Secrets**:
   Add the following secrets to your GitHub repository:
   - `VPS_HOST`: IP address of your VPS.
   - `VPS_USER`: SSH username (e.g., `root` or `ubuntu`).
   - `SSH_KEY`: Private SSH key for authentication.
   - `SSH_PORT`: SSH port (usually `22`).
   - `POSTGRES_PASSWORD`: Password for the production database.
   - Add any other environment variables needed by your app (e.g., `JWT_SECRET`, `API_KEYS`).

### Workflow Process:
1. Triggers on push to `main`.
2. Connects to VPS via SSH.
3. Pulls the latest code.
4. Generates a `.env` file using GitHub Secrets.
5. Runs `docker compose --profile prod up -d --build` to rebuild and restart the server.
6. Prunes old Docker images to save space.

## Environment Variables
The setup assumes the following environment variables:
- `NODE_ENV`: Set to `development` or `production` automatically.
- `POSTGRES_PASSWORD`, `POSTGRES_USER`, `POSTGRES_DB`: For the database connection.
- Any other variables defined in your `.env.development` or injected via secrets.
