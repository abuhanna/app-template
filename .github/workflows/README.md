# GitHub Actions Workflows

This directory contains automated workflows for CI/CD pipeline.

## Workflows

### 🔨 CI - Build and Test (`ci.yml`)
**Trigger**: Push to main/develop, Pull Requests

**What it does**:
- ✅ Build the .NET application
- ✅ Run all unit tests
- ✅ Generate code coverage reports
- ✅ Build Docker image (verification)

**Status**: Runs on every push and PR

---

### 🚀 Deploy to Production - Backend Only (`deploy.yml`)
**Trigger**: Push to main/master, Manual workflow dispatch

**What it does**:
1. **Build & Push**: Build Docker image → Push to GitHub Container Registry
2. **Connect VPN**: Establish OpenVPN connection to access private server
3. **Deploy**:
   - SSH to server
   - Copy docker-compose.yml and .env
   - Pull latest image
   - Restart containers with zero-downtime

**Use case**: Backend-only deployment without frontend

**Status**: Automatic on push to main, or run manually

---

### 🌐 Deploy Fullstack - Frontend + Backend (`deploy-fullstack.yml`)
**Trigger**: Push to main/master, Manual workflow dispatch

**What it does**:
1. **Build Backend**: Build backend image from this repo
2. **Build Frontend**: Checkout and build frontend from separate repo
3. **Push Images**: Push both images to GitHub Container Registry
4. **Connect VPN**: Establish OpenVPN connection
5. **Deploy**:
   - SSH to server
   - Copy docker-compose.yml, nginx configs, and .env
   - Pull both images
   - Start all services (nginx, backend, frontend, database)

**Use case**: Complete fullstack application deployment

**Status**: Manual trigger only (to avoid conflicts with backend-only deployment)

**Required**: `FRONTEND_PAT` secret for accessing frontend repository

---

## Quick Start

### 1️⃣ Setup Required Secrets

Go to: **Repository Settings → Secrets and variables → Actions**

Add these secrets:

| Secret | Description | Example | Required For |
|--------|-------------|---------|--------------|
| `OPENVPN_CONFIG` | Complete OpenVPN config file | (see docs) | All deployments |
| `SSH_PRIVATE_KEY` | SSH private key for server access | `-----BEGIN OPENSSH...` | All deployments |
| `SERVER_HOST` | Server IP/hostname (via VPN) | `192.168.1.100` | All deployments |
| `SERVER_USER` | SSH username | `deployer` | All deployments |
| `DEPLOY_PATH` | Deployment directory on server | `/opt/apptemplate` | All deployments |
| `DB_USER` | PostgreSQL username | `apptemplate_user` | All deployments |
| `DB_PASSWORD` | PostgreSQL password | `SecurePass123` | All deployments |
| `DB_NAME` | Database name | `apptemplate_production` | All deployments |
| `JWT_SECRET` | JWT signing secret | `YourSecretKey` | All deployments |
| `JWT_ISSUER` | JWT issuer | `AppTemplate` | All deployments |
| `JWT_AUDIENCE` | JWT audience | `AppTemplate` | All deployments |
| `SSO_API_BASE_URL` | SSO API URL | `http://sso:8083` | All deployments |
| `FRONTEND_PAT` | GitHub PAT to access frontend repo | `ghp_xxxxx...` | **Fullstack only** |

### 2️⃣ Prepare Server

```bash
# Install Docker & Docker Compose
sudo apt-get update
sudo apt-get install -y docker.io docker-compose

# Create deployment directory
mkdir -p /opt/apptemplate

# Add SSH public key
echo "your-public-key" >> ~/.ssh/authorized_keys
```

### 3️⃣ Trigger Deployment

**Automatic**: Push to `main` branch
```bash
git push origin main
```

**Manual**:
1. Go to Actions tab
2. Select "Deploy to Production"
3. Click "Run workflow"
4. Select branch
5. Click "Run workflow"

---

## Monitoring

### View Workflow Status
- Go to **Actions** tab in repository
- Click on workflow run to see logs
- Each step shows detailed output

### Check Deployment on Server
```bash
# SSH to server
ssh user@server

# Check containers
cd /opt/apptemplate
docker-compose ps

# View logs
docker-compose logs -f

# Check health
curl http://localhost:5100/health
```

---

## Troubleshooting

### ❌ VPN Connection Failed
- Verify `OPENVPN_CONFIG` secret is complete
- Check VPN server is accessible
- Increase connection wait time

### ❌ SSH Connection Failed
- Verify `SSH_PRIVATE_KEY` format (include headers)
- Check public key is in server's `~/.ssh/authorized_keys`
- Verify `SERVER_HOST` is reachable through VPN

### ❌ Docker Pull Failed
- Check GitHub Container Registry permissions
- Verify image was built successfully
- Try manual login: `echo $TOKEN | docker login ghcr.io -u USERNAME --password-stdin`

### ❌ Container Won't Start
- Check `.env` file on server
- Verify database credentials
- View logs: `docker-compose logs -f app`

---

## Documentation

For detailed documentation, see: [`docs/GITHUB_ACTIONS_DEPLOYMENT.md`](../../docs/GITHUB_ACTIONS_DEPLOYMENT.md)

Includes:
- 📖 Complete setup guide
- 🔐 Security best practices
- 🔧 Manual deployment procedures
- 🔄 Rollback instructions
- 💰 Cost optimization tips
