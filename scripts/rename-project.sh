#!/bin/bash

# Rename AppTemplate project to a custom name
# Usage: ./rename-project.sh "MyCompany.MyApp"

set -e

# Check if name is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <NewName>"
    echo "Example: $0 MyCompany.MyApp"
    exit 1
fi

NEW_NAME="$1"

# Validate name format (Company.Project)
if ! [[ "$NEW_NAME" =~ ^[A-Za-z][A-Za-z0-9]*(\.[A-Za-z][A-Za-z0-9]*)+$ ]]; then
    echo "Error: Name must be in format 'Company.Project' (e.g., 'MyCompany.MyApp')"
    exit 1
fi

# Get script directory and root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$ROOT_DIR/backend-dotnet"

# Convert name formats
OLD_DOT_NAME="App.Template"
OLD_NAMESPACE="AppTemplate"
NEW_DOT_NAME="$NEW_NAME"
NEW_NAMESPACE="${NEW_NAME//./}"

echo -e "\033[36mRenaming project from '$OLD_DOT_NAME' to '$NEW_DOT_NAME'\033[0m"
echo -e "\033[36mNamespace will change from '$OLD_NAMESPACE' to '$NEW_NAMESPACE'\033[0m"
echo ""

# Step 1: Rename folders
echo -e "\033[33mStep 1: Renaming folders...\033[0m"

declare -a folders=(
    "src/Core/App.Template.Domain:src/Core/$NEW_DOT_NAME.Domain"
    "src/Core/App.Template.Application:src/Core/$NEW_DOT_NAME.Application"
    "src/Infrastructure/App.Template.Infrastructure:src/Infrastructure/$NEW_DOT_NAME.Infrastructure"
    "src/Presentation/App.Template.WebAPI:src/Presentation/$NEW_DOT_NAME.WebAPI"
    "tests/App.Template.Domain.Tests:tests/$NEW_DOT_NAME.Domain.Tests"
    "tests/App.Template.Application.Tests:tests/$NEW_DOT_NAME.Application.Tests"
)

for folder_pair in "${folders[@]}"; do
    OLD_PATH="$BACKEND_DIR/${folder_pair%%:*}"
    NEW_PATH="$BACKEND_DIR/${folder_pair##*:}"
    if [ -d "$OLD_PATH" ]; then
        mv "$OLD_PATH" "$NEW_PATH"
        echo -e "  \033[32mRenamed: ${folder_pair%%:*} -> ${folder_pair##*:}\033[0m"
    fi
done

# Step 2: Rename .csproj files
echo ""
echo -e "\033[33mStep 2: Renaming .csproj files...\033[0m"

find "$BACKEND_DIR" -name "App.Template.*.csproj" | while read -r file; do
    dir=$(dirname "$file")
    oldname=$(basename "$file")
    newname="${oldname//App.Template/$NEW_DOT_NAME}"
    mv "$file" "$dir/$newname"
    echo -e "  \033[32mRenamed: $oldname -> $newname\033[0m"
done

# Step 3: Rename solution file
echo ""
echo -e "\033[33mStep 3: Renaming solution file...\033[0m"

if [ -f "$BACKEND_DIR/App.Template.sln" ]; then
    mv "$BACKEND_DIR/App.Template.sln" "$BACKEND_DIR/$NEW_DOT_NAME.sln"
    echo -e "  \033[32mRenamed: App.Template.sln -> $NEW_DOT_NAME.sln\033[0m"
fi

# Step 4: Update file contents
echo ""
echo -e "\033[33mStep 4: Updating file contents...\033[0m"

# Function to update file contents
update_file() {
    local file="$1"
    if [ -f "$file" ]; then
        # Use sed to replace both patterns
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/App\.Template/$NEW_DOT_NAME/g" "$file"
            sed -i '' "s/AppTemplate/$NEW_NAMESPACE/g" "$file"
        else
            # Linux
            sed -i "s/App\.Template/$NEW_DOT_NAME/g" "$file"
            sed -i "s/AppTemplate/$NEW_NAMESPACE/g" "$file"
        fi
    fi
}

# Update .csproj files
find "$BACKEND_DIR" -name "*.csproj" | while read -r file; do
    update_file "$file"
done

# Update .cs files
find "$BACKEND_DIR" -name "*.cs" | while read -r file; do
    update_file "$file"
done

# Update solution file
find "$BACKEND_DIR" -name "*.sln" | while read -r file; do
    update_file "$file"
done

# Update Dockerfile
update_file "$ROOT_DIR/Dockerfile"

# Update Makefile
update_file "$ROOT_DIR/Makefile"

# Update CLAUDE.md
update_file "$ROOT_DIR/CLAUDE.md"

echo -e "  \033[32mUpdated file contents\033[0m"

# Step 5: Verify build
echo ""
echo -e "\033[33mStep 5: Verifying build...\033[0m"

cd "$BACKEND_DIR"
if dotnet build; then
    echo -e "  \033[32mBuild successful!\033[0m"
else
    echo -e "  \033[31mBuild failed. Please check the errors above.\033[0m"
fi

echo ""
echo -e "\033[36mRename complete!\033[0m"
echo ""
echo -e "\033[33mNext steps:\033[0m"
echo "  1. Review the changes with 'git diff'"
echo "  2. Run 'dotnet test' to verify tests pass"
echo "  3. Commit the changes"
