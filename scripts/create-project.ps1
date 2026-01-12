<#
.SYNOPSIS
    Creates a new project from the AppTemplate scaffolding.

.DESCRIPTION
    This script creates a new fullstack, backend-only, or frontend-only application project
    from the AppTemplate. It supports multiple frontend UI frameworks and provides an
    interactive wizard for configuration.

.PARAMETER OutputPath
    The directory where the new project will be created.

.PARAMETER ProjectName
    The name of the new project in the format "Company.Project" (e.g., "MyCompany.MyApp").

.PARAMETER ProjectType
    The type of project to create: "fullstack" (default), "backend", or "frontend".

.PARAMETER Backend
    The backend framework to use: "dotnet" (default) or "spring".

.PARAMETER Frontend
    The frontend framework to use. Currently only "vue" is supported.

.PARAMETER UI
    The UI library to use for Vue frontend: "vuetify" (default) or "primevue".

.EXAMPLE
    .\create-project.ps1 -OutputPath "C:\Projects\MyApp" -ProjectName "MyCompany.MyApp"

.EXAMPLE
    .\create-project.ps1 -OutputPath "C:\Projects\MyApp" -ProjectName "MyCompany.MyApp" -ProjectType backend

.EXAMPLE
    .\create-project.ps1 -OutputPath "C:\Projects\MyApp" -ProjectName "MyCompany.MyApp" -ProjectType frontend -UI primevue
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$OutputPath,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[A-Za-z][A-Za-z0-9]*(\.[A-Za-z][A-Za-z0-9]*)+$')]
    [string]$ProjectName,

    [Parameter(Mandatory = $false)]
    [ValidateSet("fullstack", "backend", "frontend")]
    [string]$ProjectType,

    [Parameter(Mandatory = $false)]
    [ValidateSet("dotnet", "spring", "nestjs")]
    [string]$Backend,

    [Parameter(Mandatory = $false)]
    [ValidateSet("vue")]
    [string]$Frontend,

    [Parameter(Mandatory = $false)]
    [ValidateSet("vuetify", "primevue")]
    [string]$UI
)

# Colors for output
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "`n>> $Message" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "[OK] $Message" "Green"
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-ColorOutput "[ERROR] $Message" "Red"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "[WARN] $Message" "Yellow"
}

# Banner
Write-ColorOutput @"

    _                _____                    _       _
   / \   _ __  _ __ |_   _|__ _ __ ___  _ __ | | __ _| |_ ___
  / _ \ | '_ \| '_ \  | |/ _ \ '_ ` _ \| '_ \| |/ _` | __/ _ \
 / ___ \| |_) | |_) | | |  __/ | | | | | |_) | | (_| | ||  __/
/_/   \_\ .__/| .__/  |_|\___|_| |_| |_| .__/|_|\__,_|\__\___|
        |_|   |_|                      |_|

"@ "Magenta"

Write-ColorOutput "Fullstack .NET + Vue Project Scaffolding" "White"
Write-ColorOutput "=========================================" "DarkGray"
Write-ColorOutput "Multi-Step Project Wizard`n" "DarkGray"

# Get script directory (template root)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TemplateRoot = Split-Path -Parent $ScriptDir

# Validate template structure
$RequiredDirs = @("backend-dotnet", "frontend-vuetify", "scripts")
foreach ($dir in $RequiredDirs) {
    if (-not (Test-Path (Join-Path $TemplateRoot $dir))) {
        Write-ErrorMsg "Template structure is invalid. Missing directory: $dir"
        exit 1
    }
}

# Check available frontends
$HasPrimeVue = Test-Path (Join-Path $TemplateRoot "frontend-primevue")

# ================================
# Step 1: Project Type Selection
# ================================
if (-not $ProjectType) {
    Write-ColorOutput "Step 1: Select Project Type" "Yellow"
    Write-ColorOutput "  [1] Fullstack (Backend + Frontend) - Default" "White"
    Write-ColorOutput "  [2] Backend Only (.NET API)" "White"
    Write-ColorOutput "  [3] Frontend Only (Vue SPA)" "White"
    Write-Host ""

    $selection = Read-Host "Enter selection (1-3, default: 1)"

    switch ($selection) {
        "2" { $ProjectType = "backend" }
        "3" { $ProjectType = "frontend" }
        default { $ProjectType = "fullstack" }
    }
}

# ================================
# Step 2: Backend Framework Selection (if applicable)
# ================================
$IncludeBackend = $ProjectType -eq "fullstack" -or $ProjectType -eq "backend"

$HasSpringBoot = Test-Path (Join-Path $TemplateRoot "backend-spring")
$HasNestJS = Test-Path (Join-Path $TemplateRoot "backend-nestjs")

if ($IncludeBackend -and -not $Backend) {
    Write-ColorOutput "`nStep 2: Select Backend Framework" "Yellow"
    Write-ColorOutput "  [1] .NET 8 (Clean Architecture) - Default" "White"
    if ($HasSpringBoot) {
        Write-ColorOutput "  [2] Java Spring Boot 3 (Clean Architecture)" "White"
    } else {
        Write-ColorOutput "  [2] Java Spring Boot (Not Available)" "DarkGray"
    }
    if ($HasNestJS) {
        Write-ColorOutput "  [3] Node.js NestJS (Clean Architecture)" "White"
    } else {
        Write-ColorOutput "  [3] NestJS (Not Available)" "DarkGray"
    }
    Write-Host ""

    $selection = Read-Host "Enter selection (1-3, default: 1)"

    switch ($selection) {
        "2" {
            if ($HasSpringBoot) {
                $Backend = "spring"
            } else {
                Write-ErrorMsg "Java Spring Boot is not available in this template."
                exit 1
            }
        }
        "3" {
            if ($HasNestJS) {
                $Backend = "nestjs"
            } else {
                Write-ErrorMsg "NestJS is not available in this template."
                exit 1
            }
        }
        default { $Backend = "dotnet" }
    }
}

# ================================
# Step 3: Frontend Framework Selection (if applicable)
# ================================
$IncludeFrontend = $ProjectType -eq "fullstack" -or $ProjectType -eq "frontend"

if ($IncludeFrontend -and -not $Frontend) {
    Write-ColorOutput "`nStep 3: Select Frontend Framework" "Yellow"
    Write-ColorOutput "  [1] Vue 3 - Default" "White"
    Write-ColorOutput "  [2] React (Coming Soon)" "DarkGray"
    Write-ColorOutput "  [3] Angular (Coming Soon)" "DarkGray"
    Write-Host ""

    $selection = Read-Host "Enter selection (1, default: 1)"

    switch ($selection) {
        "2" {
            Write-ErrorMsg "React is not yet available. Please select Vue 3."
            exit 1
        }
        "3" {
            Write-ErrorMsg "Angular is not yet available. Please select Vue 3."
            exit 1
        }
        default { $Frontend = "vue" }
    }
}

# ================================
# Step 4: UI Library Selection (if Vue selected)
# ================================
if ($IncludeFrontend -and $Frontend -eq "vue" -and -not $UI) {
    Write-ColorOutput "`nStep 4: Select UI Library" "Yellow"
    Write-ColorOutput "  [1] Vuetify (Material Design) - Default" "White"
    if ($HasPrimeVue) {
        Write-ColorOutput "  [2] PrimeVue" "White"
    } else {
        Write-ColorOutput "  [2] PrimeVue (Not Available)" "DarkGray"
    }
    Write-Host ""

    $selection = Read-Host "Enter selection (1-2, default: 1)"

    if ($selection -eq "2" -and $HasPrimeVue) {
        $UI = "primevue"
    } elseif ($selection -eq "2" -and -not $HasPrimeVue) {
        Write-ErrorMsg "PrimeVue frontend is not available in this template."
        exit 1
    } else {
        $UI = "vuetify"
    }
}

# Set defaults if not set
if ($IncludeBackend -and -not $Backend) { $Backend = "dotnet" }
if ($IncludeFrontend -and -not $Frontend) { $Frontend = "vue" }
if ($IncludeFrontend -and -not $UI) { $UI = "vuetify" }

# ================================
# Configuration Summary
# ================================
Write-ColorOutput "`n=========================================" "DarkGray"
Write-ColorOutput "Project Configuration Summary" "Yellow"
Write-ColorOutput "=========================================" "DarkGray"
Write-ColorOutput "  Project Name: $ProjectName" "White"
Write-ColorOutput "  Output Path:  $OutputPath" "White"
Write-ColorOutput "  Project Type: $ProjectType" "White"
if ($IncludeBackend) {
    Write-ColorOutput "  Backend:      $Backend" "White"
}
if ($IncludeFrontend) {
    Write-ColorOutput "  Frontend:     $Frontend" "White"
    Write-ColorOutput "  UI Library:   $UI" "White"
}
Write-ColorOutput "=========================================" "DarkGray"
Write-Host ""

# Confirm
$confirm = Read-Host "Continue? (Y/n)"
if ($confirm -eq "n" -or $confirm -eq "N") {
    Write-ColorOutput "Cancelled." "Yellow"
    exit 0
}

# ================================
# Create Output Directory
# ================================
Write-Step "Creating project directory..."
if (Test-Path $OutputPath) {
    Write-ErrorMsg "Output directory already exists: $OutputPath"
    exit 1
}

New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
Write-Success "Created directory: $OutputPath"

# ================================
# Copy Backend (if applicable)
# ================================
if ($IncludeBackend) {
    switch ($Backend) {
        "spring" {
            Write-Step "Copying backend (Java Spring Boot 3)..."
            Copy-Item -Path (Join-Path $TemplateRoot "backend-spring") -Destination (Join-Path $OutputPath "backend") -Recurse
        }
        "nestjs" {
            Write-Step "Copying backend (Node.js NestJS)..."
            Copy-Item -Path (Join-Path $TemplateRoot "backend-nestjs") -Destination (Join-Path $OutputPath "backend") -Recurse
        }
        default {
            Write-Step "Copying backend (.NET 8)..."
            Copy-Item -Path (Join-Path $TemplateRoot "backend-dotnet") -Destination (Join-Path $OutputPath "backend") -Recurse
        }
    }
    Write-Success "Copied backend"
}

# ================================
# Copy Frontend (if applicable)
# ================================
if ($IncludeFrontend) {
    $FrontendSource = if ($UI -eq "primevue") { "frontend-primevue" } else { "frontend-vuetify" }
    Write-Step "Copying frontend ($Frontend + $UI)..."
    Copy-Item -Path (Join-Path $TemplateRoot $FrontendSource) -Destination (Join-Path $OutputPath "frontend") -Recurse
    Write-Success "Copied frontend"
}

# ================================
# Copy Docker and Config Files
# ================================
Write-Step "Copying configuration files..."

# Common files for all project types
$CommonFiles = @(".gitignore", "README.md", "CLAUDE.md")
foreach ($file in $CommonFiles) {
    $sourcePath = Join-Path $TemplateRoot $file
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $OutputPath
    }
}

# Copy appropriate Docker files based on project type
switch ($ProjectType) {
    "fullstack" {
        # Copy fullstack Docker files
        $FullstackFiles = @(
            "docker-compose.yml",
            "docker-compose.staging.yml",
            "docker-compose.production.yml",
            "Dockerfile",
            "Makefile",
            ".env.example"
        )
        foreach ($file in $FullstackFiles) {
            $sourcePath = Join-Path $TemplateRoot $file
            if (Test-Path $sourcePath) {
                Copy-Item -Path $sourcePath -Destination $OutputPath
            }
        }
        # Copy docker directory
        $DockerDir = Join-Path $TemplateRoot "docker"
        if (Test-Path $DockerDir) {
            Copy-Item -Path $DockerDir -Destination (Join-Path $OutputPath "docker") -Recurse
        }
    }
    "backend" {
        # Copy backend-only Docker files
        $sourcePath = Join-Path $TemplateRoot "docker-compose.backend.yml"
        if (Test-Path $sourcePath) {
            Copy-Item -Path $sourcePath -Destination (Join-Path $OutputPath "docker-compose.yml")
        }
        # Copy Dockerfile.backend as Dockerfile
        $sourceDockerfile = Join-Path $TemplateRoot "docker\Dockerfile.backend"
        if (Test-Path $sourceDockerfile) {
            Copy-Item -Path $sourceDockerfile -Destination (Join-Path $OutputPath "Dockerfile")
        }
        # Create backend-only .env.example
        $envContent = @"
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
"@
        Set-Content -Path (Join-Path $OutputPath ".env.example") -Value $envContent
    }
    "frontend" {
        # Copy frontend-only Docker files
        $sourcePath = Join-Path $TemplateRoot "docker-compose.frontend.yml"
        if (Test-Path $sourcePath) {
            Copy-Item -Path $sourcePath -Destination (Join-Path $OutputPath "docker-compose.yml")
        }
        # Copy Dockerfile.frontend as Dockerfile
        $sourceDockerfile = Join-Path $TemplateRoot "docker\Dockerfile.frontend"
        if (Test-Path $sourceDockerfile) {
            Copy-Item -Path $sourceDockerfile -Destination (Join-Path $OutputPath "Dockerfile")
        }
        # Copy nginx config
        New-Item -ItemType Directory -Path (Join-Path $OutputPath "docker\nginx") -Force | Out-Null
        $sourceNginx = Join-Path $TemplateRoot "docker\nginx\frontend-only.conf"
        if (Test-Path $sourceNginx) {
            Copy-Item -Path $sourceNginx -Destination (Join-Path $OutputPath "docker\nginx\frontend-only.conf")
        }
        # Create frontend-only .env.example
        $envContent = @"
# Backend API URL
VITE_API_BASE_URL=http://localhost:5100/api

# Web Server Port
WEB_PORT=80
"@
        Set-Content -Path (Join-Path $OutputPath ".env.example") -Value $envContent
    }
}

Write-Success "Copied configuration files"

# ================================
# Rename Backend Project (if applicable)
# ================================
if ($IncludeBackend) {
    Write-Step "Renaming backend project to $ProjectName..."

    # Convert project name formats
    $NewNameDot = $ProjectName  # Company.Project
    $NewNamespace = $ProjectName -replace '\.', ''  # CompanyProject
    $NewNameLower = $NewNamespace.ToLower()  # companyproject (for Java/Node packages)

    $OldNameDot = "App.Template"
    $OldNamespace = "AppTemplate"
    $OldNameLower = "apptemplate"

    # Backend path
    $BackendPath = Join-Path $OutputPath "backend"

    if ($Backend -eq "nestjs") {
        # NestJS project renaming
        # Update package.json
        $packageJsonPath = Join-Path $BackendPath "package.json"
        if (Test-Path $packageJsonPath) {
            $content = Get-Content -Path $packageJsonPath -Raw
            if ($content) {
                $content = $content -replace '"apptemplate-backend"', "`"$NewNameLower-backend`""
                Set-Content -Path $packageJsonPath -Value $content -NoNewline
            }
        }

        # Update TypeScript source files
        Get-ChildItem -Path $BackendPath -Filter "*.ts" -Recurse | ForEach-Object {
            $content = Get-Content -Path $_.FullName -Raw
            if ($content) {
                $content = $content -replace "apptemplate", $NewNameLower
                $content = $content -replace "AppTemplate", $NewNamespace
                Set-Content -Path $_.FullName -Value $content -NoNewline
            }
        }

    } elseif ($Backend -eq "spring") {
        # Spring Boot project renaming
        # Update pom.xml files
        Get-ChildItem -Path $BackendPath -Filter "pom.xml" -Recurse | ForEach-Object {
            $content = Get-Content -Path $_.FullName -Raw
            if ($content) {
                $content = $content -replace "apptemplate", $NewNameLower
                $content = $content -replace "AppTemplate", $NewNamespace
                Set-Content -Path $_.FullName -Value $content -NoNewline
            }
        }

        # Update Java source files
        Get-ChildItem -Path $BackendPath -Filter "*.java" -Recurse | ForEach-Object {
            $content = Get-Content -Path $_.FullName -Raw
            if ($content) {
                $content = $content -replace "apptemplate", $NewNameLower
                $content = $content -replace "AppTemplate", $NewNamespace
                Set-Content -Path $_.FullName -Value $content -NoNewline
            }
        }

        # Update application.yml
        Get-ChildItem -Path $BackendPath -Filter "application.yml" -Recurse | ForEach-Object {
            $content = Get-Content -Path $_.FullName -Raw
            if ($content) {
                $content = $content -replace "AppTemplate", $NewNamespace
                Set-Content -Path $_.FullName -Value $content -NoNewline
            }
        }

        # Rename Java package directories
        Get-ChildItem -Path $BackendPath -Directory -Recurse | Where-Object { $_.Name -eq "apptemplate" } | ForEach-Object {
            Rename-Item -Path $_.FullName -NewName $NewNameLower
        }

    } else {
        # .NET project renaming
        # Rename folders
        $FolderMappings = @{
            "src\Core\App.Template.Domain" = "src\Core\$NewNameDot.Domain"
            "src\Core\App.Template.Application" = "src\Core\$NewNameDot.Application"
            "src\Infrastructure\App.Template.Infrastructure" = "src\Infrastructure\$NewNameDot.Infrastructure"
            "src\Presentation\App.Template.WebAPI" = "src\Presentation\$NewNameDot.WebAPI"
            "tests\App.Template.Domain.Tests" = "tests\$NewNameDot.Domain.Tests"
            "tests\App.Template.Application.Tests" = "tests\$NewNameDot.Application.Tests"
        }

        foreach ($mapping in $FolderMappings.GetEnumerator()) {
            $oldPath = Join-Path $BackendPath $mapping.Key
            $newPath = Join-Path $BackendPath $mapping.Value
            if (Test-Path $oldPath) {
                $parentPath = Split-Path -Parent $newPath
                if (-not (Test-Path $parentPath)) {
                    New-Item -ItemType Directory -Path $parentPath -Force | Out-Null
                }
                Rename-Item -Path $oldPath -NewName (Split-Path -Leaf $newPath)
            }
        }

        # Rename .csproj files
        Get-ChildItem -Path $BackendPath -Filter "App.Template.*.csproj" -Recurse | ForEach-Object {
            $newName = $_.Name -replace "App\.Template", $NewNameDot
            Rename-Item -Path $_.FullName -NewName $newName
        }

        # Rename solution file
        $oldSln = Join-Path $BackendPath "App.Template.sln"
        if (Test-Path $oldSln) {
            Rename-Item -Path $oldSln -NewName "$NewNameDot.sln"
        }

        # Update file contents
        $FileExtensions = @("*.csproj", "*.cs", "*.sln")
        foreach ($ext in $FileExtensions) {
            Get-ChildItem -Path $BackendPath -Filter $ext -Recurse | ForEach-Object {
                $content = Get-Content -Path $_.FullName -Raw
                if ($content) {
                    $content = $content -replace [regex]::Escape($OldNameDot), $NewNameDot
                    $content = $content -replace $OldNamespace, $NewNamespace
                    Set-Content -Path $_.FullName -Value $content -NoNewline
                }
            }
        }
    }

    Write-Success "Renamed backend project"
}

# ================================
# Update Dockerfile (if exists)
# ================================
$dockerfilePath = Join-Path $OutputPath "Dockerfile"
if ((Test-Path $dockerfilePath) -and $IncludeBackend) {
    $content = Get-Content -Path $dockerfilePath -Raw
    $content = $content -replace [regex]::Escape("App.Template"), $ProjectName
    $content = $content -replace "AppTemplate", ($ProjectName -replace '\.', '')
    Set-Content -Path $dockerfilePath -Value $content -NoNewline
}

# ================================
# Update Makefile (if exists)
# ================================
$makefilePath = Join-Path $OutputPath "Makefile"
if ((Test-Path $makefilePath) -and $IncludeBackend) {
    $content = Get-Content -Path $makefilePath -Raw
    $content = $content -replace [regex]::Escape("App.Template"), $ProjectName
    Set-Content -Path $makefilePath -Value $content -NoNewline
}

# ================================
# Update Frontend package.json (if applicable)
# ================================
if ($IncludeFrontend) {
    $packageJsonPath = Join-Path $OutputPath "frontend\package.json"
    if (Test-Path $packageJsonPath) {
        $content = Get-Content -Path $packageJsonPath -Raw
        $projectNameLower = ($ProjectName -replace '\.', '').ToLower()
        $content = $content -replace '"apptemplate-frontend"', "`"$projectNameLower-frontend`""
        Set-Content -Path $packageJsonPath -Value $content -NoNewline
    }
}

# ================================
# Build Verification (Backend only)
# ================================
if ($IncludeBackend) {
    Write-Step "Verifying backend build..."
    Push-Location (Join-Path $OutputPath "backend")

    switch ($Backend) {
        "spring" {
            # Check if Maven wrapper exists and make it executable
            if (Test-Path "mvnw.cmd") {
                $buildResult = & .\mvnw.cmd compile -q 2>&1
            } elseif (Get-Command mvn -ErrorAction SilentlyContinue) {
                $buildResult = & mvn compile -q 2>&1
            } else {
                Write-Warning "Maven not found. Skipping build verification."
                $LASTEXITCODE = -1
            }
        }
        "nestjs" {
            # Check if Node.js is available and run npm install + build
            if (Get-Command npm -ErrorAction SilentlyContinue) {
                Write-ColorOutput "  Installing dependencies..." "DarkGray"
                $installResult = & npm install --silent 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-ColorOutput "  Building TypeScript..." "DarkGray"
                    $buildResult = & npm run build 2>&1
                }
            } else {
                Write-Warning "Node.js/npm not found. Skipping build verification."
                $LASTEXITCODE = -1
            }
        }
        default {
            $buildResult = & dotnet build "$ProjectName.sln" --nologo -v q 2>&1
        }
    }

    Pop-Location

    if ($LASTEXITCODE -eq 0) {
        Write-Success "Backend build verification passed"
    } elseif ($LASTEXITCODE -ne -1) {
        Write-Warning "Backend build verification failed. Please check the project manually."
    }
}

# ================================
# Summary
# ================================
Write-ColorOutput "`n=========================================" "DarkGray"
Write-ColorOutput "Project created successfully!" "Green"
Write-ColorOutput "=========================================" "DarkGray"

Write-ColorOutput "`nProject Location: $OutputPath" "White"
Write-ColorOutput "Project Type:     $ProjectType" "White"

Write-ColorOutput "`nNext steps:" "Yellow"
Write-ColorOutput "  1. cd `"$OutputPath`"" "White"
Write-ColorOutput "  2. Copy .env.example to .env and configure" "White"

switch ($ProjectType) {
    "fullstack" {
        Write-ColorOutput "  3. docker-compose up -d  (or run backend and frontend separately)" "White"
        Write-ColorOutput "`nManual setup:" "Yellow"
        switch ($Backend) {
            "spring" {
                Write-ColorOutput "  Backend:  cd backend && ./mvnw spring-boot:run -pl app-api" "White"
            }
            "nestjs" {
                Write-ColorOutput "  Backend:  cd backend && npm install && npm run start:dev" "White"
            }
            default {
                Write-ColorOutput "  Backend:  cd backend && dotnet run --project src/Presentation/$ProjectName.WebAPI" "White"
            }
        }
        Write-ColorOutput "  Frontend: cd frontend && npm install && npm run dev" "White"
    }
    "backend" {
        Write-ColorOutput "  3. docker-compose up -d  (or run directly)" "White"
        Write-ColorOutput "`nManual setup:" "Yellow"
        switch ($Backend) {
            "spring" {
                Write-ColorOutput "  cd backend && ./mvnw spring-boot:run -pl app-api" "White"
            }
            "nestjs" {
                Write-ColorOutput "  cd backend && npm install && npm run start:dev" "White"
            }
            default {
                Write-ColorOutput "  cd backend && dotnet run --project src/Presentation/$ProjectName.WebAPI" "White"
            }
        }
    }
    "frontend" {
        Write-ColorOutput "  3. docker-compose up -d  (or run npm directly)" "White"
        Write-ColorOutput "`nManual setup:" "Yellow"
        Write-ColorOutput "  cd frontend && npm install && npm run dev" "White"
    }
}

Write-ColorOutput ""
