# AppTemplate Setup Script for Windows
# This script sets up the development environment for AppTemplate

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  AppTemplate Setup Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[OK] " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARN] " -ForegroundColor Yellow -NoNewline
    Write-Host $Message
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] " -ForegroundColor Red -NoNewline
    Write-Host $Message
}

# Check if running from project root
if (-not (Test-Path "docker-compose.yml")) {
    Write-Error "Please run this script from the project root directory"
    exit 1
}

# Step 1: Create .env file if it doesn't exist
Write-Host "Step 1: Setting up environment files..."
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Status "Created .env file from .env.example"
    Write-Warning "Please edit .env file with your configuration before starting the application"
} else {
    Write-Status ".env file already exists"
}

# Step 2: Install frontend dependencies
Write-Host ""
Write-Host "Step 2: Installing frontend dependencies..."
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Push-Location frontend-vuetify
        npm install
        Pop-Location
        Write-Status "Frontend dependencies installed"
    }
} catch {
    Write-Warning "npm not found. Please install Node.js and run 'npm install' in the frontend directory"
}

# Step 3: Restore backend packages
Write-Host ""
Write-Host "Step 3: Restoring backend NuGet packages..."
try {
    $dotnetVersion = dotnet --version 2>$null
    if ($dotnetVersion) {
        Push-Location backend-dotnet
        dotnet restore
        Pop-Location
        Write-Status "Backend packages restored"
    }
} catch {
    Write-Warning "dotnet not found. Please install .NET 8 SDK and run 'dotnet restore' in the backend directory"
}

# Step 4: Setup Husky (Git hooks)
Write-Host ""
Write-Host "Step 4: Setting up Git hooks..."
if (Test-Path ".git") {
    try {
        Push-Location frontend-vuetify
        npm run prepare 2>$null
        Pop-Location
        Write-Status "Git hooks configured"
    } catch {
        Write-Warning "Could not setup Husky. Run 'npm run prepare' in frontend directory after git init"
    }
} else {
    Write-Warning "Not a git repository. Git hooks will be set up after git init"
}

# Done
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Edit .env file with your configuration"
Write-Host "  2. Start with Docker:  docker compose up -d --build"
Write-Host "  3. Or run manually:"
Write-Host "     - Backend:  cd backend-dotnet\src\Presentation\App.Template.WebAPI && dotnet run"
Write-Host "     - Frontend: cd frontend-vuetify && npm run dev"
Write-Host ""
Write-Host "Access points:"
Write-Host "  - Frontend: http://localhost (Docker) or http://localhost:3000 (dev)"
Write-Host "  - Backend:  http://localhost:5100"
Write-Host "  - Swagger:  http://localhost:5100/swagger"
Write-Host ""
Write-Host "Default login: admin / Admin@123" -ForegroundColor Yellow
Write-Host ""
