#!/bin/bash

# ================================
# AppTemplate Project Scaffolding CLI
# Creates fullstack, backend-only, or frontend-only projects
# ================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Output functions
print_color() {
    echo -e "${2}${1}${NC}"
}

print_step() {
    echo -e "\n${CYAN}>> ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}[OK] ${1}${NC}"
}

print_error() {
    echo -e "${RED}[ERROR] ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}[WARN] ${1}${NC}"
}

# Banner
print_banner() {
    print_color "
    _                _____                    _       _
   / \\   _ __  _ __ |_   _|__ _ __ ___  _ __ | | __ _| |_ ___
  / _ \\ | '_ \\| '_ \\  | |/ _ \\ '_ \` _ \\| '_ \\| |/ _\` | __/ _ \\
 / ___ \\| |_) | |_) | | |  __/ | | | | | |_) | | (_| | ||  __/
/_/   \\_\\ .__/| .__/  |_|\\___|_| |_| |_| .__/|_|\\__,_|\\__\\___|
        |_|   |_|                      |_|
" "$MAGENTA"

    print_color "Fullstack .NET + Vue Project Scaffolding" "$WHITE"
    print_color "=========================================" "$GRAY"
    print_color "Multi-Step Project Wizard\n" "$GRAY"
}

show_usage() {
    echo "Usage: $0 -o <output_path> -n <project_name> [-t <type>] [-b <backend>] [-f <frontend>] [-u <ui>]"
    echo ""
    echo "Options:"
    echo "  -o  Output directory path (required)"
    echo "  -n  Project name in format Company.Project (required)"
    echo "  -t  Project type: fullstack, backend, frontend (default: fullstack)"
    echo "  -b  Backend framework: dotnet (default: dotnet)"
    echo "  -f  Frontend framework: vue (default: vue)"
    echo "  -u  UI library: vuetify, primevue (default: vuetify)"
    echo "  -h  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -o ~/projects/myapp -n \"MyCompany.MyApp\""
    echo "  $0 -o ~/projects/myapp -n \"MyCompany.MyApp\" -t backend"
    echo "  $0 -o ~/projects/myapp -n \"MyCompany.MyApp\" -t frontend -u primevue"
}

# Default values
OUTPUT_PATH=""
PROJECT_NAME=""
PROJECT_TYPE=""
BACKEND=""
FRONTEND=""
UI=""

# Parse arguments
while getopts "o:n:t:b:f:u:h" opt; do
    case $opt in
        o) OUTPUT_PATH="$OPTARG" ;;
        n) PROJECT_NAME="$OPTARG" ;;
        t) PROJECT_TYPE="$OPTARG" ;;
        b) BACKEND="$OPTARG" ;;
        f) FRONTEND="$OPTARG" ;;
        u) UI="$OPTARG" ;;
        h)
            show_usage
            exit 0
            ;;
        \?)
            print_error "Invalid option: -$OPTARG"
            exit 1
            ;;
    esac
done

# Get script directory (template root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_ROOT="$(dirname "$SCRIPT_DIR")"

# Print banner
print_banner

# Validate template structure
for dir in "backend-dotnet" "frontend-vuetify" "scripts"; do
    if [ ! -d "$TEMPLATE_ROOT/$dir" ]; then
        print_error "Template structure is invalid. Missing directory: $dir"
        exit 1
    fi
done

# Check available frontends
HAS_PRIMEVUE=false
if [ -d "$TEMPLATE_ROOT/frontend-primevue" ]; then
    HAS_PRIMEVUE=true
fi

# Check available backends
HAS_SPRING=false
HAS_NESTJS=false
if [ -d "$TEMPLATE_ROOT/backend-spring" ]; then
    HAS_SPRING=true
fi
if [ -d "$TEMPLATE_ROOT/backend-nestjs" ]; then
    HAS_NESTJS=true
fi

# Validate required arguments
if [ -z "$OUTPUT_PATH" ]; then
    print_error "Output path is required. Use -o <path>"
    exit 1
fi

if [ -z "$PROJECT_NAME" ]; then
    print_error "Project name is required. Use -n <name>"
    exit 1
fi

# Validate project name format
if ! [[ "$PROJECT_NAME" =~ ^[A-Za-z][A-Za-z0-9]*(\.[A-Za-z][A-Za-z0-9]*)+$ ]]; then
    print_error "Project name must be in format: Company.Project (e.g., MyCompany.MyApp)"
    exit 1
fi

# ================================
# Step 1: Project Type Selection
# ================================
if [ -z "$PROJECT_TYPE" ]; then
    print_color "Step 1: Select Project Type" "$YELLOW"
    print_color "  [1] Fullstack (Backend + Frontend) - Default" "$WHITE"
    print_color "  [2] Backend Only (.NET API)" "$WHITE"
    print_color "  [3] Frontend Only (Vue SPA)" "$WHITE"
    echo ""

    read -p "Enter selection (1-3, default: 1): " selection

    case $selection in
        2) PROJECT_TYPE="backend" ;;
        3) PROJECT_TYPE="frontend" ;;
        *) PROJECT_TYPE="fullstack" ;;
    esac
fi

# Validate project type
case $PROJECT_TYPE in
    fullstack|backend|frontend) ;;
    *)
        print_error "Invalid project type: $PROJECT_TYPE. Must be: fullstack, backend, or frontend"
        exit 1
        ;;
esac

# Determine what to include
INCLUDE_BACKEND=false
INCLUDE_FRONTEND=false
if [ "$PROJECT_TYPE" = "fullstack" ] || [ "$PROJECT_TYPE" = "backend" ]; then
    INCLUDE_BACKEND=true
fi
if [ "$PROJECT_TYPE" = "fullstack" ] || [ "$PROJECT_TYPE" = "frontend" ]; then
    INCLUDE_FRONTEND=true
fi

# ================================
# Step 2: Backend Framework Selection (if applicable)
# ================================
if [ "$INCLUDE_BACKEND" = true ] && [ -z "$BACKEND" ]; then
    print_color "\nStep 2: Select Backend Framework" "$YELLOW"
    print_color "  [1] .NET 8 (Clean Architecture) - Default" "$WHITE"
    if [ "$HAS_SPRING" = true ]; then
        print_color "  [2] Java Spring Boot 3 (Clean Architecture)" "$WHITE"
    else
        print_color "  [2] Java Spring Boot (Not Available)" "$GRAY"
    fi
    if [ "$HAS_NESTJS" = true ]; then
        print_color "  [3] Node.js NestJS (Clean Architecture)" "$WHITE"
    else
        print_color "  [3] NestJS (Not Available)" "$GRAY"
    fi
    echo ""

    read -p "Enter selection (1-3, default: 1): " selection

    case $selection in
        2)
            if [ "$HAS_SPRING" = true ]; then
                BACKEND="spring"
            else
                print_error "Java Spring Boot is not available in this template."
                exit 1
            fi
            ;;
        3)
            if [ "$HAS_NESTJS" = true ]; then
                BACKEND="nestjs"
            else
                print_error "NestJS is not available in this template."
                exit 1
            fi
            ;;
        *) BACKEND="dotnet" ;;
    esac
fi

# ================================
# Step 3: Frontend Framework Selection (if applicable)
# ================================
if [ "$INCLUDE_FRONTEND" = true ] && [ -z "$FRONTEND" ]; then
    print_color "\nStep 3: Select Frontend Framework" "$YELLOW"
    print_color "  [1] Vue 3 - Default" "$WHITE"
    print_color "  [2] React (Coming Soon)" "$GRAY"
    print_color "  [3] Angular (Coming Soon)" "$GRAY"
    echo ""

    read -p "Enter selection (1, default: 1): " selection

    case $selection in
        2)
            print_error "React is not yet available. Please select Vue 3."
            exit 1
            ;;
        3)
            print_error "Angular is not yet available. Please select Vue 3."
            exit 1
            ;;
        *) FRONTEND="vue" ;;
    esac
fi

# ================================
# Step 4: UI Library Selection (if Vue selected)
# ================================
if [ "$INCLUDE_FRONTEND" = true ] && [ "$FRONTEND" = "vue" ] && [ -z "$UI" ]; then
    print_color "\nStep 4: Select UI Library" "$YELLOW"
    print_color "  [1] Vuetify (Material Design) - Default" "$WHITE"
    if [ "$HAS_PRIMEVUE" = true ]; then
        print_color "  [2] PrimeVue" "$WHITE"
    else
        print_color "  [2] PrimeVue (Not Available)" "$GRAY"
    fi
    echo ""

    read -p "Enter selection (1-2, default: 1): " selection

    if [ "$selection" = "2" ]; then
        if [ "$HAS_PRIMEVUE" = true ]; then
            UI="primevue"
        else
            print_error "PrimeVue frontend is not available in this template."
            exit 1
        fi
    else
        UI="vuetify"
    fi
fi

# Set defaults if not set
if [ "$INCLUDE_BACKEND" = true ] && [ -z "$BACKEND" ]; then
    BACKEND="dotnet"
fi
if [ "$INCLUDE_FRONTEND" = true ] && [ -z "$FRONTEND" ]; then
    FRONTEND="vue"
fi
if [ "$INCLUDE_FRONTEND" = true ] && [ -z "$UI" ]; then
    UI="vuetify"
fi

# ================================
# Configuration Summary
# ================================
print_color "\n=========================================" "$GRAY"
print_color "Project Configuration Summary" "$YELLOW"
print_color "=========================================" "$GRAY"
print_color "  Project Name: $PROJECT_NAME" "$WHITE"
print_color "  Output Path:  $OUTPUT_PATH" "$WHITE"
print_color "  Project Type: $PROJECT_TYPE" "$WHITE"
if [ "$INCLUDE_BACKEND" = true ]; then
    print_color "  Backend:      $BACKEND" "$WHITE"
fi
if [ "$INCLUDE_FRONTEND" = true ]; then
    print_color "  Frontend:     $FRONTEND" "$WHITE"
    print_color "  UI Library:   $UI" "$WHITE"
fi
print_color "=========================================" "$GRAY"
echo ""

# Confirm
read -p "Continue? (Y/n): " confirm
if [ "$confirm" = "n" ] || [ "$confirm" = "N" ]; then
    print_color "Cancelled." "$YELLOW"
    exit 0
fi

# ================================
# Create Output Directory
# ================================
print_step "Creating project directory..."
if [ -d "$OUTPUT_PATH" ]; then
    print_error "Output directory already exists: $OUTPUT_PATH"
    exit 1
fi

mkdir -p "$OUTPUT_PATH"
print_success "Created directory: $OUTPUT_PATH"

# ================================
# Copy Backend (if applicable)
# ================================
if [ "$INCLUDE_BACKEND" = true ]; then
    case $BACKEND in
        spring)
            print_step "Copying backend (Java Spring Boot 3)..."
            cp -r "$TEMPLATE_ROOT/backend-spring" "$OUTPUT_PATH/backend"
            ;;
        nestjs)
            print_step "Copying backend (Node.js NestJS)..."
            cp -r "$TEMPLATE_ROOT/backend-nestjs" "$OUTPUT_PATH/backend"
            ;;
        *)
            print_step "Copying backend (.NET 8)..."
            cp -r "$TEMPLATE_ROOT/backend-dotnet" "$OUTPUT_PATH/backend"
            ;;
    esac
    print_success "Copied backend"
fi

# ================================
# Copy Frontend (if applicable)
# ================================
if [ "$INCLUDE_FRONTEND" = true ]; then
    FRONTEND_SOURCE="frontend-vuetify"
    if [ "$UI" = "primevue" ]; then
        FRONTEND_SOURCE="frontend-primevue"
    fi
    print_step "Copying frontend ($FRONTEND + $UI)..."
    cp -r "$TEMPLATE_ROOT/$FRONTEND_SOURCE" "$OUTPUT_PATH/frontend"
    print_success "Copied frontend"
fi

# ================================
# Copy Docker and Config Files
# ================================
print_step "Copying configuration files..."

# Common files for all project types
for file in ".gitignore" "README.md" "CLAUDE.md"; do
    if [ -f "$TEMPLATE_ROOT/$file" ]; then
        cp "$TEMPLATE_ROOT/$file" "$OUTPUT_PATH/"
    fi
done

# Copy appropriate Docker files based on project type
case $PROJECT_TYPE in
    fullstack)
        # Copy fullstack Docker files
        for file in "docker-compose.yml" "docker-compose.staging.yml" "docker-compose.production.yml" "Dockerfile" "Makefile" ".env.example"; do
            if [ -f "$TEMPLATE_ROOT/$file" ]; then
                cp "$TEMPLATE_ROOT/$file" "$OUTPUT_PATH/"
            fi
        done
        # Copy docker directory
        if [ -d "$TEMPLATE_ROOT/docker" ]; then
            cp -r "$TEMPLATE_ROOT/docker" "$OUTPUT_PATH/docker"
        fi
        ;;
    backend)
        # Copy backend-only Docker files
        if [ -f "$TEMPLATE_ROOT/docker-compose.backend.yml" ]; then
            cp "$TEMPLATE_ROOT/docker-compose.backend.yml" "$OUTPUT_PATH/docker-compose.yml"
        fi
        # Copy Dockerfile.backend as Dockerfile
        if [ -f "$TEMPLATE_ROOT/docker/Dockerfile.backend" ]; then
            cp "$TEMPLATE_ROOT/docker/Dockerfile.backend" "$OUTPUT_PATH/Dockerfile"
        fi
        # Create backend-only .env.example
        cat > "$OUTPUT_PATH/.env.example" << 'EOF'
# Database Configuration
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=apptemplate_dev
DB_PORT=5432

# API Configuration
API_PORT=5100
ASPNETCORE_ENVIRONMENT=Development

# JWT Configuration (minimum 32 characters)
JWT_SECRET=your-dev-secret-key-minimum-32-characters-long
JWT_ISSUER=AppTemplate
JWT_AUDIENCE=AppTemplate

# SSO Configuration (optional)
SSO_API_BASE_URL=
EOF
        ;;
    frontend)
        # Copy frontend-only Docker files
        if [ -f "$TEMPLATE_ROOT/docker-compose.frontend.yml" ]; then
            cp "$TEMPLATE_ROOT/docker-compose.frontend.yml" "$OUTPUT_PATH/docker-compose.yml"
        fi
        # Copy Dockerfile.frontend as Dockerfile
        if [ -f "$TEMPLATE_ROOT/docker/Dockerfile.frontend" ]; then
            cp "$TEMPLATE_ROOT/docker/Dockerfile.frontend" "$OUTPUT_PATH/Dockerfile"
        fi
        # Copy nginx config
        mkdir -p "$OUTPUT_PATH/docker/nginx"
        if [ -f "$TEMPLATE_ROOT/docker/nginx/frontend-only.conf" ]; then
            cp "$TEMPLATE_ROOT/docker/nginx/frontend-only.conf" "$OUTPUT_PATH/docker/nginx/frontend-only.conf"
        fi
        # Create frontend-only .env.example
        cat > "$OUTPUT_PATH/.env.example" << 'EOF'
# Backend API URL
VITE_API_BASE_URL=http://localhost:5100/api

# Web Server Port
WEB_PORT=80
EOF
        ;;
esac

print_success "Copied configuration files"

# ================================
# Rename Backend Project (if applicable)
# ================================
if [ "$INCLUDE_BACKEND" = true ]; then
    print_step "Renaming backend project to $PROJECT_NAME..."

    # Convert project name formats
    NEW_NAME_DOT="$PROJECT_NAME"  # Company.Project
    NEW_NAMESPACE="${PROJECT_NAME//./}"  # CompanyProject
    NEW_NAME_LOWER=$(echo "$NEW_NAMESPACE" | tr '[:upper:]' '[:lower:]')  # companyproject

    OLD_NAME_DOT="App.Template"
    OLD_NAMESPACE="AppTemplate"
    OLD_NAME_LOWER="apptemplate"

    BACKEND_PATH="$OUTPUT_PATH/backend"

    case $BACKEND in
        nestjs)
            # NestJS project renaming
            # Update package.json
            if [ -f "$BACKEND_PATH/package.json" ]; then
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    sed -i '' "s/apptemplate-backend/$NEW_NAME_LOWER-backend/g" "$BACKEND_PATH/package.json"
                else
                    sed -i "s/apptemplate-backend/$NEW_NAME_LOWER-backend/g" "$BACKEND_PATH/package.json"
                fi
            fi

            # Update TypeScript source files
            if [[ "$OSTYPE" == "darwin"* ]]; then
                find "$BACKEND_PATH" -name "*.ts" -type f | while read -r file; do
                    sed -i '' "s/apptemplate/$NEW_NAME_LOWER/g" "$file"
                    sed -i '' "s/AppTemplate/$NEW_NAMESPACE/g" "$file"
                done
            else
                find "$BACKEND_PATH" -name "*.ts" -type f | while read -r file; do
                    sed -i "s/apptemplate/$NEW_NAME_LOWER/g" "$file"
                    sed -i "s/AppTemplate/$NEW_NAMESPACE/g" "$file"
                done
            fi
            ;;

        spring)
            # Spring Boot project renaming
            # Update pom.xml files
            if [[ "$OSTYPE" == "darwin"* ]]; then
                find "$BACKEND_PATH" -name "pom.xml" -type f | while read -r file; do
                    sed -i '' "s/apptemplate/$NEW_NAME_LOWER/g" "$file"
                    sed -i '' "s/AppTemplate/$NEW_NAMESPACE/g" "$file"
                done
                # Update Java source files
                find "$BACKEND_PATH" -name "*.java" -type f | while read -r file; do
                    sed -i '' "s/apptemplate/$NEW_NAME_LOWER/g" "$file"
                    sed -i '' "s/AppTemplate/$NEW_NAMESPACE/g" "$file"
                done
                # Update application.yml
                find "$BACKEND_PATH" -name "application.yml" -type f | while read -r file; do
                    sed -i '' "s/AppTemplate/$NEW_NAMESPACE/g" "$file"
                done
            else
                find "$BACKEND_PATH" -name "pom.xml" -type f | while read -r file; do
                    sed -i "s/apptemplate/$NEW_NAME_LOWER/g" "$file"
                    sed -i "s/AppTemplate/$NEW_NAMESPACE/g" "$file"
                done
                find "$BACKEND_PATH" -name "*.java" -type f | while read -r file; do
                    sed -i "s/apptemplate/$NEW_NAME_LOWER/g" "$file"
                    sed -i "s/AppTemplate/$NEW_NAMESPACE/g" "$file"
                done
                find "$BACKEND_PATH" -name "application.yml" -type f | while read -r file; do
                    sed -i "s/AppTemplate/$NEW_NAMESPACE/g" "$file"
                done
            fi

            # Rename Java package directories
            find "$BACKEND_PATH" -type d -name "apptemplate" | while read -r dir; do
                mv "$dir" "$(dirname "$dir")/$NEW_NAME_LOWER"
            done
            ;;

        *)
            # .NET project renaming
            # Rename folders
            declare -A FOLDER_MAPPINGS=(
                ["src/Core/App.Template.Domain"]="src/Core/$NEW_NAME_DOT.Domain"
                ["src/Core/App.Template.Application"]="src/Core/$NEW_NAME_DOT.Application"
                ["src/Infrastructure/App.Template.Infrastructure"]="src/Infrastructure/$NEW_NAME_DOT.Infrastructure"
                ["src/Presentation/App.Template.WebAPI"]="src/Presentation/$NEW_NAME_DOT.WebAPI"
                ["tests/App.Template.Domain.Tests"]="tests/$NEW_NAME_DOT.Domain.Tests"
                ["tests/App.Template.Application.Tests"]="tests/$NEW_NAME_DOT.Application.Tests"
            )

            for old_path in "${!FOLDER_MAPPINGS[@]}"; do
                new_path="${FOLDER_MAPPINGS[$old_path]}"
                if [ -d "$BACKEND_PATH/$old_path" ]; then
                    new_name=$(basename "$new_path")
                    mv "$BACKEND_PATH/$old_path" "$BACKEND_PATH/$(dirname "$old_path")/$new_name"
                fi
            done

            # Rename .csproj files
            find "$BACKEND_PATH" -name "App.Template.*.csproj" | while read -r file; do
                new_name=$(basename "$file" | sed "s/App\.Template/$NEW_NAME_DOT/g")
                mv "$file" "$(dirname "$file")/$new_name"
            done

            # Rename solution file
            if [ -f "$BACKEND_PATH/App.Template.sln" ]; then
                mv "$BACKEND_PATH/App.Template.sln" "$BACKEND_PATH/$NEW_NAME_DOT.sln"
            fi

            # Update file contents - use different sed syntax for macOS vs Linux
            if [[ "$OSTYPE" == "darwin"* ]]; then
                find "$BACKEND_PATH" \( -name "*.csproj" -o -name "*.cs" -o -name "*.sln" \) -type f | while read -r file; do
                    sed -i '' "s/App\.Template/$NEW_NAME_DOT/g" "$file"
                    sed -i '' "s/$OLD_NAMESPACE/$NEW_NAMESPACE/g" "$file"
                done
            else
                find "$BACKEND_PATH" \( -name "*.csproj" -o -name "*.cs" -o -name "*.sln" \) -type f | while read -r file; do
                    sed -i "s/App\.Template/$NEW_NAME_DOT/g" "$file"
                    sed -i "s/$OLD_NAMESPACE/$NEW_NAMESPACE/g" "$file"
                done
            fi
            ;;
    esac

    print_success "Renamed backend project"
fi

# ================================
# Update Dockerfile (if exists)
# ================================
if [ -f "$OUTPUT_PATH/Dockerfile" ] && [ "$INCLUDE_BACKEND" = true ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/App\.Template/$PROJECT_NAME/g" "$OUTPUT_PATH/Dockerfile"
        sed -i '' "s/AppTemplate/${PROJECT_NAME//./}/g" "$OUTPUT_PATH/Dockerfile"
    else
        sed -i "s/App\.Template/$PROJECT_NAME/g" "$OUTPUT_PATH/Dockerfile"
        sed -i "s/AppTemplate/${PROJECT_NAME//./}/g" "$OUTPUT_PATH/Dockerfile"
    fi
fi

# ================================
# Update Makefile (if exists)
# ================================
if [ -f "$OUTPUT_PATH/Makefile" ] && [ "$INCLUDE_BACKEND" = true ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/App\.Template/$PROJECT_NAME/g" "$OUTPUT_PATH/Makefile"
    else
        sed -i "s/App\.Template/$PROJECT_NAME/g" "$OUTPUT_PATH/Makefile"
    fi
fi

# ================================
# Update Frontend package.json (if applicable)
# ================================
if [ "$INCLUDE_FRONTEND" = true ] && [ -f "$OUTPUT_PATH/frontend/package.json" ]; then
    PROJECT_NAME_LOWER=$(echo "${PROJECT_NAME//./}" | tr '[:upper:]' '[:lower:]')
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/apptemplate-frontend/$PROJECT_NAME_LOWER-frontend/g" "$OUTPUT_PATH/frontend/package.json"
    else
        sed -i "s/apptemplate-frontend/$PROJECT_NAME_LOWER-frontend/g" "$OUTPUT_PATH/frontend/package.json"
    fi
fi

# ================================
# Build Verification (Backend only)
# ================================
if [ "$INCLUDE_BACKEND" = true ]; then
    print_step "Verifying backend build..."
    pushd "$OUTPUT_PATH/backend" > /dev/null

    case $BACKEND in
        spring)
            # Check if Maven wrapper exists
            if [ -f "mvnw" ]; then
                chmod +x mvnw
                if ./mvnw compile -q 2>&1; then
                    print_success "Backend build verification passed"
                else
                    print_warning "Backend build verification failed. Please check the project manually."
                fi
            elif command -v mvn &> /dev/null; then
                if mvn compile -q 2>&1; then
                    print_success "Backend build verification passed"
                else
                    print_warning "Backend build verification failed. Please check the project manually."
                fi
            else
                print_warning "Maven not found. Skipping build verification."
            fi
            ;;

        nestjs)
            # Check if npm is available
            if command -v npm &> /dev/null; then
                print_color "  Installing dependencies..." "$GRAY"
                if npm install --silent 2>&1; then
                    print_color "  Building TypeScript..." "$GRAY"
                    if npm run build 2>&1; then
                        print_success "Backend build verification passed"
                    else
                        print_warning "Backend build verification failed. Please check the project manually."
                    fi
                else
                    print_warning "npm install failed. Please check the project manually."
                fi
            else
                print_warning "Node.js/npm not found. Skipping build verification."
            fi
            ;;

        *)
            if dotnet build "$PROJECT_NAME.sln" --nologo -v q 2>&1; then
                print_success "Backend build verification passed"
            else
                print_warning "Backend build verification failed. Please check the project manually."
            fi
            ;;
    esac

    popd > /dev/null
fi

# ================================
# Summary
# ================================
print_color "\n=========================================" "$GRAY"
print_color "Project created successfully!" "$GREEN"
print_color "=========================================" "$GRAY"

print_color "\nProject Location: $OUTPUT_PATH" "$WHITE"
print_color "Project Type:     $PROJECT_TYPE" "$WHITE"

print_color "\nNext steps:" "$YELLOW"
print_color "  1. cd \"$OUTPUT_PATH\"" "$WHITE"
print_color "  2. Copy .env.example to .env and configure" "$WHITE"

case $PROJECT_TYPE in
    fullstack)
        print_color "  3. docker-compose up -d  (or run backend and frontend separately)" "$WHITE"
        print_color "\nManual setup:" "$YELLOW"
        case $BACKEND in
            spring)
                print_color "  Backend:  cd backend && ./mvnw spring-boot:run -pl app-api" "$WHITE"
                ;;
            nestjs)
                print_color "  Backend:  cd backend && npm install && npm run start:dev" "$WHITE"
                ;;
            *)
                print_color "  Backend:  cd backend && dotnet run --project src/Presentation/$PROJECT_NAME.WebAPI" "$WHITE"
                ;;
        esac
        print_color "  Frontend: cd frontend && npm install && npm run dev" "$WHITE"
        ;;
    backend)
        print_color "  3. docker-compose up -d  (or run directly)" "$WHITE"
        print_color "\nManual setup:" "$YELLOW"
        case $BACKEND in
            spring)
                print_color "  cd backend && ./mvnw spring-boot:run -pl app-api" "$WHITE"
                ;;
            nestjs)
                print_color "  cd backend && npm install && npm run start:dev" "$WHITE"
                ;;
            *)
                print_color "  cd backend && dotnet run --project src/Presentation/$PROJECT_NAME.WebAPI" "$WHITE"
                ;;
        esac
        ;;
    frontend)
        print_color "  3. docker-compose up -d  (or run npm directly)" "$WHITE"
        print_color "\nManual setup:" "$YELLOW"
        print_color "  cd frontend && npm install && npm run dev" "$WHITE"
        ;;
esac

echo ""
