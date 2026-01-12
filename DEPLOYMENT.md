# Deployment Guide

Comprehensive guide for deploying AppTemplate application to different environments.

## Table of Contents

1. [Environments Overview](#environments-overview)
2. [Deployment Architecture](#deployment-architecture)
3. [Docker Deployment](#docker-deployment)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Environment Variables](#environment-variables)
6. [Manual Deployment](#manual-deployment)
7. [Monitoring & Logs](#monitoring--logs)
8. [Rollback Strategy](#rollback-strategy)

## Environments Overview

| Environment | Branch | Image Tag | Auto-Deploy | Access | App Ports |
|-------------|--------|-----------|-------------|--------|-----------|
| **Development** | `feature/*` | `local` | No (manual) | localhost | 80, 5432 |
| **Staging** | `develop` | `staging` | Yes (on push) | Staging server | 8080 |
| **Production** | `main` | `production` | Yes (on push) | Production server | 8080 |

Development exposes database port for local debugging. Staging/Production do not expose database ports (Docker network only).

### Environment Characteristics

**Development:**
- Local development with Docker Compose
- Auto-migration enabled
- Debug logging enabled
- CORS: Allow all origins
- Database: Local PostgreSQL container

**Staging:**
- Deployed to staging server via GitHub Actions
- Testing environment for QA
- Production-like configuration
- Optional SSO integration
- Database: Staging PostgreSQL instance

**Production:**
- Deployed to production server via GitHub Actions
- Full security enabled
- Performance monitoring
- Optional SSO integration
- Database: Production PostgreSQL instance

## Deployment Architecture

### Network Architecture

**Multi-Server Setup with VPN Access:**

```
Internet --> Load Balancer/Nginx --> VPN Tunnel --> Internal Servers
              |-- staging.example.com ----> VPN ----> Staging Server:8080
              |-- app.example.com --------> VPN ----> Production Server:8080
```

**Port Allocation Strategy:**
- Each environment runs on a **separate server** (staging != production server)
- Each server hosts **multiple applications** (shared hosting)
- Staging & production can use **same ports** (different servers)
- Port numbers only need to be unique **within each server**
- Load balancer routes by domain to specific server:port combinations

### Unified Container Architecture

All environments use a **single unified Docker container** approach:

```
+---------------------------------------+
|     Unified Application Container      |
|                                        |
|  +----------------------------------+  |
|  |  Supervisor (Process Manager)    |  |
|  +----------------------------------+  |
|              |         |               |
|    +-----------+  +-----------+       |
|    |  Backend  |  |   Nginx   |       |
|    | .NET 8 API|  | (Port 80) |       |
|    | (Port 8080)|  |           |       |
|    +-----------+  +-----------+       |
|                        |               |
|                 +-----------------+    |
|                 | Frontend Files  |    |
|                 | (Static /dist)  |    |
|                 +-----------------+    |
+---------------------------------------+
              |
+---------------------------------------+
|    PostgreSQL Database Container       |
|         (Separate Container)           |
+---------------------------------------+
```

**Why Single Container?**
- Simplified deployment (one image to manage)
- Easier networking (localhost communication)
- Atomic deployments (backend + frontend always in sync)
- Reduced resource overhead
- Faster container startup

**Components:**
- **Supervisor**: Manages multiple processes in single container
- **Backend**: .NET 8 API listening on port 8080
- **Nginx**: Reverse proxy on port 80/443, serves frontend static files
- **Database**: Separate PostgreSQL container for data persistence

## Docker Deployment

### Local Development

**1. Setup Environment**
```bash
# Copy environment template
cp .env.example .env

# Edit with your local configuration
# - Database credentials
# - JWT secret
# - SSO API URL (optional)
```

**2. Start Services**
```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f

# Check service status
docker compose ps
```

**3. Access Application**
- Frontend: http://localhost
- Backend API: http://localhost:5100
- Swagger UI: http://localhost:5100/swagger
- Database: localhost:5432

**Default Login:**
- Username: `admin`
- Password: `Admin@123`

**4. Stop Services**
```bash
# Stop containers (preserve data)
docker compose down

# Stop and remove volumes (deletes database)
docker compose down -v
```

### Building Docker Image

**Build unified image:**
```bash
docker build -t apptemplate:latest .
```

**Build with custom API URL:**
```bash
docker build \
  --build-arg VITE_API_URL=/api \
  -t apptemplate:latest .
```

**Multi-stage build process:**
1. **Stage 1**: Build backend (.NET 8)
2. **Stage 2**: Build frontend (Node.js + Vite)
3. **Stage 3**: Runtime (combine backend + frontend + nginx + supervisor)

## CI/CD Pipeline

### GitHub Actions Workflows

**Staging Pipeline** (`.github/workflows/deploy-staging.yml`)

Triggered on: Push to `develop` branch

**Steps:**
1. Checkout code
2. Set up Docker Buildx
3. Login to GitHub Container Registry
4. Build unified Docker image
5. Push image with tags: `staging`, `develop`, `staging-{SHA}`
6. Connect to server via OpenVPN
7. Install sshpass and setup SSH access
8. Create deployment directory on server (`mkdir -p $DEPLOY_PATH`)
9. Copy deployment files (`docker-compose.staging.yml`, `.env`)
10. Pull latest image on server
11. Deploy with `docker compose up -d`
12. Disconnect VPN

**Production Pipeline** (`.github/workflows/deploy-production.yml`)

Triggered on: Push to `main` branch

**Steps:**
1-6. Same as staging
7. Install sshpass and setup SSH access
8. Create deployment directory on server (`mkdir -p $DEPLOY_PATH`)
9. Copy deployment files (`docker-compose.production.yml`, `.env`)
10. Pull latest image with tags: `production`, `latest`, `main`, `prod-{SHA}`
11. Deploy with `docker compose up -d`
12. Health checks (application + API endpoints)
13. Disconnect VPN

### Deployment Flow

```
Developer --> Push to develop --> GitHub Actions --> Staging Server
Developer --> Push to main    --> GitHub Actions --> Production Server
```

**Automatic Rollout:**
```bash
# Staging
git push origin develop

# Wait for GitHub Actions to complete
# Staging server automatically updated
```

**Production Deployment:**
```bash
# Merge develop to main
git checkout main
git merge develop
git push origin main

# GitHub Actions automatically deploys to production
```

## Environment Variables

### .env File Structure

**Development (.env):**
```bash
# Database
DB_USER=postgres
DB_PASSWORD=your_dev_password
DB_NAME=apptemplate_dev

# JWT Configuration
JWT_SECRET=your-dev-secret-key-minimum-32-characters-long
JWT_ISSUER=AppTemplate
JWT_AUDIENCE=AppTemplate

# SSO API (optional - leave empty for local auth only)
SSO_API_BASE_URL=

# Frontend Build
VITE_API_URL=/api

# Docker Image (optional for local)
APP_IMAGE=apptemplate:local
```

**Staging (.env.staging - generated by CI/CD):**
```bash
# Database
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_ISSUER=${JWT_ISSUER}
JWT_AUDIENCE=${JWT_AUDIENCE}

# SSO (optional)
SSO_API_BASE_URL=${SSO_API_BASE_URL}

# Application
ASPNETCORE_ENVIRONMENT=Staging
APP_PORT=${APP_PORT}
APP_PORT_SSL=${APP_PORT_SSL}

# Docker Image
APP_IMAGE=ghcr.io/{repo}:staging

# API URL
API_URL=/api
```

**Production (.env.production - generated by CI/CD):**
```bash
# Database
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_ISSUER=${JWT_ISSUER}
JWT_AUDIENCE=${JWT_AUDIENCE}

# SSO (optional)
SSO_API_BASE_URL=${SSO_API_BASE_URL}

# Application
ASPNETCORE_ENVIRONMENT=Production
APP_PORT=${APP_PORT}
APP_PORT_SSL=${APP_PORT_SSL}

# Docker Image
APP_IMAGE=ghcr.io/{repo}:production

# API URL
API_URL=/api
```

### GitHub Secrets Configuration

**Required Secrets for CI/CD:**

**VPN Access:**
```
OPENVPN_CONFIG          # OpenVPN configuration file content
OPENVPN_AUTH            # OpenVPN credentials (optional)
```

**Shared Secrets (Used for Both Staging & Production):**
```
# SSH Access
SSH_USER                # SSH username
SSH_PASSWORD            # SSH password
DEPLOY_PATH             # Deployment directory path

# Database
DB_USER                 # Database username
DB_PASSWORD             # Database password
DB_NAME                 # Database name

# JWT Authentication
JWT_SECRET              # JWT signing secret (32+ characters)
JWT_ISSUER              # JWT issuer (e.g., AppTemplate)
JWT_AUDIENCE            # JWT audience (e.g., AppTemplate)

# SSO Integration (optional)
SSO_API_BASE_URL        # SSO API base URL

# Application Ports
APP_PORT                # Application HTTP port (e.g., 8080)
APP_PORT_SSL            # Application HTTPS port (e.g., 8443)
```

**Environment-Specific Secrets:**
```
# Staging
STAGING_SERVER_HOST     # Staging server IP/hostname

# Production
PRODUCTION_SERVER_HOST  # Production server IP/hostname
```

**Auto-provided by GitHub:**
```
GITHUB_TOKEN            # Automatic token for GHCR access
```

### Setting Up Secrets

1. Go to repository Settings -> Secrets and variables -> Actions
2. Click "New repository secret"
3. Add each secret with exact name and value
4. Secrets are encrypted and not visible after saved

**Important Notes:**
- SSH password authentication must be enabled on target servers
- Edit `/etc/ssh/sshd_config` and ensure `PasswordAuthentication yes`
- Restart SSH service: `sudo systemctl restart sshd`
- Use strong passwords for SSH access
- Deployment directory will be created automatically by workflow (no manual setup needed)

### Port Configuration Strategy

**Why Unique Ports for Application?**

Since staging and production servers host **multiple applications**, each application needs unique HTTP/HTTPS ports to avoid conflicts with other apps on the same server.

**Port Allocation:**

| Environment | HTTP Port | HTTPS Port | Database Port | Notes |
|-------------|-----------|------------|---------------|-------|
| Development | 80 | 443 | 5432 (exposed) | Default ports (local only) |
| Staging | 8080 | 8443 | N/A (not exposed) | Same as Production (different servers) |
| Production | 8080 | 8443 | N/A (not exposed) | Same as Staging (different servers) |

**Why Database Port Not Exposed?**

- Database containers are **isolated per application** via Docker networks
- **No port conflicts** - each app has its own PostgreSQL container
- **More secure** - database only accessible via Docker network (app container)
- **Best practice** - production databases should not be directly accessible from host
- Backend connects via: `Host=db;Port=5432` (internal Docker network)

**Why Same Ports for Staging & Production?**

Since staging and production run on **separate servers**, they can safely use the same port numbers. This simplifies configuration and ensures consistency between environments.

**Configurable via GitHub Secrets:**

Application port numbers can be changed by updating these shared secrets:
- `APP_PORT` (default: 8080) - HTTP port for both staging & production
- `APP_PORT_SSL` (default: 8443) - HTTPS port for both staging & production

**Nginx Configuration Example:**

```nginx
# Staging
server {
    listen 80;
    server_name staging.example.com;

    location / {
        proxy_pass http://10.x.x.x:8080;  # Staging Server IP + APP_PORT
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Production
server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://10.y.y.y:8080;  # Production Server IP + APP_PORT (same port, different server)
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Manual Deployment

### Deploying to Staging

**1. Build and push image manually:**
```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Build image
docker build -t ghcr.io/{repo}/apptemplate:staging .

# Push image
docker push ghcr.io/{repo}/apptemplate:staging
```

**2. Deploy on server:**
```bash
# SSH to staging server (will prompt for password)
ssh user@staging-server

# Or use sshpass for non-interactive login
sshpass -p 'your-password' ssh user@staging-server

# Navigate to deployment directory
cd /path/to/deployment

# Pull latest image
docker pull ghcr.io/{repo}/apptemplate:staging

# Restart services
docker compose -f docker-compose.staging.yml down
docker compose -f docker-compose.staging.yml up -d

# Check logs
docker compose logs -f app
```

### Deploying to Production

**Same steps as staging, but:**
- Use `production` tag instead of `staging`
- Use `docker compose -f docker-compose.production.yml`
- SSH to production server

### Zero-Downtime Deployment (Future Enhancement)

Consider implementing:
- Blue-Green deployment
- Rolling updates
- Health check before routing traffic

## Monitoring & Logs

### Viewing Logs

**Docker Compose:**
```bash
# All services
docker compose logs -f

# Application only
docker compose logs -f app

# Database only
docker compose logs -f db

# Last 100 lines
docker compose logs --tail=100 app
```

**Individual Containers:**
```bash
# List containers
docker ps

# View logs
docker logs <container-id> -f

# View logs with timestamps
docker logs <container-id> -f --timestamps
```

### Health Checks

**Application Health Endpoints:**
```bash
# Backend health
curl http://localhost/health

# API endpoint check
curl http://localhost/api

# Swagger (development only)
curl http://localhost/swagger
```

**Container Health Status:**
```bash
docker compose ps
# Check "Status" column for health status
```

### Performance Monitoring

**Docker Stats:**
```bash
# Real-time container stats
docker stats

# Specific container
docker stats apptemplate-app-staging
```

**Database Monitoring:**
```bash
# Connect to database
docker exec -it apptemplate-db-staging psql -U postgres

# Check connections
SELECT * FROM pg_stat_activity;

# Database size
SELECT pg_size_pretty(pg_database_size('apptemplate_staging'));
```

## Rollback Strategy

### Quick Rollback

**Using Docker Image Tags:**
```bash
# On server, rollback to previous version
cd /path/to/deployment

# Pull specific version (use SHA or previous tag)
docker pull ghcr.io/{repo}/apptemplate:staging-abc1234

# Update docker-compose.yml to use specific tag
# Or set APP_IMAGE in .env
export APP_IMAGE=ghcr.io/{repo}/apptemplate:staging-abc1234

# Restart services
docker compose down
docker compose up -d
```

### Git-based Rollback

**Revert commit and redeploy:**
```bash
# Local machine
git revert <commit-hash>
git push origin main  # or develop

# GitHub Actions will auto-deploy reverted version
```

### Database Rollback

**If migration needs rollback:**
```bash
# SSH to server (will prompt for password)
ssh user@server

# Enter app container
docker exec -it apptemplate-app bash

# Rollback migration
cd /app/backend
dotnet ef database update PreviousMigrationName

# Or restore from backup
docker exec -i apptemplate-db psql -U postgres apptemplate_prod < backup.sql
```

## Troubleshooting Deployment

### Common Issues

**SSH authentication fails:**
```bash
# Check if password authentication is enabled on server
ssh user@server 'grep PasswordAuthentication /etc/ssh/sshd_config'

# Should show: PasswordAuthentication yes

# If disabled, enable it on the server:
# 1. Edit SSH config
sudo nano /etc/ssh/sshd_config

# 2. Set PasswordAuthentication yes
# 3. Restart SSH service
sudo systemctl restart sshd

# Test SSH connection
ssh user@server

# Or test with sshpass
sshpass -p 'your-password' ssh user@server 'echo "SSH OK"'
```

**Image pull fails:**
```bash
# Re-login to registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull with verbose output
docker pull ghcr.io/{repo}/apptemplate:staging --debug
```

**Container won't start:**
```bash
# Check logs for errors
docker compose logs app

# Check container status
docker compose ps

# Recreate container
docker compose up -d --force-recreate app
```

**Database connection fails:**
```bash
# Check database is running
docker compose ps db

# Check database logs
docker compose logs db

# Verify connection string in .env
cat .env | grep DB_
```

**Health check fails:**
```bash
# Check application logs
docker compose logs app

# Test health endpoint manually
curl http://localhost/health

# Check nginx configuration
docker exec apptemplate-app cat /etc/nginx/conf.d/default.conf
```

### Emergency Procedures

**Application not responding:**
```bash
# 1. Check container status
docker compose ps

# 2. Restart application
docker compose restart app

# 3. If still failing, recreate
docker compose up -d --force-recreate app

# 4. Last resort: full restart
docker compose down && docker compose up -d
```

**Out of disk space:**
```bash
# Clean unused images
docker image prune -f

# Clean stopped containers
docker container prune -f

# Clean unused volumes (careful!)
docker volume prune -f

# Clean everything (very careful!)
docker system prune -a --volumes
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Related Documentation:**
- [README.md](./README.md) - Main project overview
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development workflow
- [backend/README.md](./backend/README.md) - Backend guide
- [frontend/README.md](./frontend/README.md) - Frontend guide
