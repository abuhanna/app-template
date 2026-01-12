#!/bin/bash

# AppTemplate Setup Script
# This script sets up the development environment for AppTemplate

set -e

echo "============================================"
echo "  AppTemplate Setup Script"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running from project root
if [ ! -f "docker-compose.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Step 1: Create .env file if it doesn't exist
echo "Step 1: Setting up environment files..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    print_status "Created .env file from .env.example"
    print_warning "Please edit .env file with your configuration before starting the application"
else
    print_status ".env file already exists"
fi

# Step 2: Install frontend dependencies
echo ""
echo "Step 2: Installing frontend dependencies..."
if command -v npm &> /dev/null; then
    cd frontend-vuetify
    npm install
    print_status "Frontend dependencies installed"
    cd ..
else
    print_warning "npm not found. Please install Node.js and run 'npm install' in the frontend directory"
fi

# Step 3: Restore backend packages
echo ""
echo "Step 3: Restoring backend NuGet packages..."
if command -v dotnet &> /dev/null; then
    cd backend-dotnet
    dotnet restore
    print_status "Backend packages restored"
    cd ..
else
    print_warning "dotnet not found. Please install .NET 8 SDK and run 'dotnet restore' in the backend directory"
fi

# Step 4: Setup Husky (Git hooks)
echo ""
echo "Step 4: Setting up Git hooks..."
if [ -d ".git" ]; then
    cd frontend-vuetify
    npm run prepare 2>/dev/null || print_warning "Could not setup Husky. Run 'npm run prepare' in frontend directory after git init"
    cd ..
    print_status "Git hooks configured"
else
    print_warning "Not a git repository. Git hooks will be set up after git init"
fi

# Done
echo ""
echo "============================================"
echo "  Setup Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Edit .env file with your configuration"
echo "  2. Start with Docker:  docker compose up -d --build"
echo "  3. Or run manually:"
echo "     - Backend:  cd backend-dotnet/src/Presentation/App.Template.WebAPI && dotnet run"
echo "     - Frontend: cd frontend-vuetify && npm run dev"
echo ""
echo "Access points:"
echo "  - Frontend: http://localhost (Docker) or http://localhost:3000 (dev)"
echo "  - Backend:  http://localhost:5100"
echo "  - Swagger:  http://localhost:5100/swagger"
echo ""
echo "Default login: admin / Admin@123"
echo ""
