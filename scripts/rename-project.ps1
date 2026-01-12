<#
.SYNOPSIS
    Renames the AppTemplate project to a custom name.

.DESCRIPTION
    This script renames all occurrences of "App.Template" and "AppTemplate"
    in folder names, file names, and file contents to your desired project name.

.PARAMETER NewName
    The new project name in format "Company.Project" (e.g., "MyCompany.MyApp")

.EXAMPLE
    .\rename-project.ps1 -NewName "MyCompany.MyApp"

.NOTES
    Run this script from the root directory of the project.
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidatePattern('^[A-Za-z][A-Za-z0-9]*(\.[A-Za-z][A-Za-z0-9]*)+$')]
    [string]$NewName
)

$ErrorActionPreference = "Stop"

# Get the root directory (parent of scripts folder)
$RootDir = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $RootDir "backend-dotnet"

# Convert name formats
$OldDotName = "App.Template"
$OldNamespace = "AppTemplate"
$NewDotName = $NewName
$NewNamespace = $NewName -replace '\.', ''

Write-Host "Renaming project from '$OldDotName' to '$NewDotName'" -ForegroundColor Cyan
Write-Host "Namespace will change from '$OldNamespace' to '$NewNamespace'" -ForegroundColor Cyan
Write-Host ""

# Step 1: Rename folders
Write-Host "Step 1: Renaming folders..." -ForegroundColor Yellow

$foldersToRename = @(
    @{ Old = "src/Core/App.Template.Domain"; New = "src/Core/$NewDotName.Domain" },
    @{ Old = "src/Core/App.Template.Application"; New = "src/Core/$NewDotName.Application" },
    @{ Old = "src/Infrastructure/App.Template.Infrastructure"; New = "src/Infrastructure/$NewDotName.Infrastructure" },
    @{ Old = "src/Presentation/App.Template.WebAPI"; New = "src/Presentation/$NewDotName.WebAPI" },
    @{ Old = "tests/App.Template.Domain.Tests"; New = "tests/$NewDotName.Domain.Tests" },
    @{ Old = "tests/App.Template.Application.Tests"; New = "tests/$NewDotName.Application.Tests" }
)

foreach ($folder in $foldersToRename) {
    $oldPath = Join-Path $BackendDir $folder.Old
    $newPath = Join-Path $BackendDir $folder.New
    if (Test-Path $oldPath) {
        Rename-Item -Path $oldPath -NewName (Split-Path $newPath -Leaf)
        Write-Host "  Renamed: $($folder.Old) -> $($folder.New)" -ForegroundColor Green
    }
}

# Step 2: Rename .csproj files
Write-Host ""
Write-Host "Step 2: Renaming .csproj files..." -ForegroundColor Yellow

$csprojFiles = Get-ChildItem -Path $BackendDir -Filter "App.Template.*.csproj" -Recurse
foreach ($file in $csprojFiles) {
    $newFileName = $file.Name -replace "App\.Template", $NewDotName
    Rename-Item -Path $file.FullName -NewName $newFileName
    Write-Host "  Renamed: $($file.Name) -> $newFileName" -ForegroundColor Green
}

# Step 3: Rename solution file
Write-Host ""
Write-Host "Step 3: Renaming solution file..." -ForegroundColor Yellow

$slnFile = Join-Path $BackendDir "App.Template.sln"
if (Test-Path $slnFile) {
    $newSlnName = "$NewDotName.sln"
    Rename-Item -Path $slnFile -NewName $newSlnName
    Write-Host "  Renamed: App.Template.sln -> $newSlnName" -ForegroundColor Green
}

# Step 4: Update file contents
Write-Host ""
Write-Host "Step 4: Updating file contents..." -ForegroundColor Yellow

# Files to update
$filesToUpdate = @()

# Get all .csproj files
$filesToUpdate += Get-ChildItem -Path $BackendDir -Filter "*.csproj" -Recurse

# Get all .cs files
$filesToUpdate += Get-ChildItem -Path $BackendDir -Filter "*.cs" -Recurse

# Get solution file
$filesToUpdate += Get-ChildItem -Path $BackendDir -Filter "*.sln" -Recurse

# Get Dockerfile
$dockerfile = Join-Path $RootDir "Dockerfile"
if (Test-Path $dockerfile) {
    $filesToUpdate += Get-Item $dockerfile
}

# Get Makefile
$makefile = Join-Path $RootDir "Makefile"
if (Test-Path $makefile) {
    $filesToUpdate += Get-Item $makefile
}

# Get CLAUDE.md
$claudemd = Join-Path $RootDir "CLAUDE.md"
if (Test-Path $claudemd) {
    $filesToUpdate += Get-Item $claudemd
}

$updatedCount = 0
foreach ($file in $filesToUpdate) {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        $originalContent = $content

        # Replace dot-separated name (folder/file names)
        $content = $content -replace "App\.Template", $NewDotName

        # Replace namespace (no dots)
        $content = $content -replace "AppTemplate", $NewNamespace

        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            $updatedCount++
        }
    }
}

Write-Host "  Updated $updatedCount files" -ForegroundColor Green

# Step 5: Verify build
Write-Host ""
Write-Host "Step 5: Verifying build..." -ForegroundColor Yellow

Push-Location $BackendDir
try {
    $buildResult = dotnet build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Build successful!" -ForegroundColor Green
    } else {
        Write-Host "  Build failed. Please check the errors above." -ForegroundColor Red
        Write-Host $buildResult
    }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "Rename complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review the changes with 'git diff'"
Write-Host "  2. Run 'dotnet test' to verify tests pass"
Write-Host "  3. Commit the changes"
