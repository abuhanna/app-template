# Contributing to AppTemplate

Thank you for contributing to AppTemplate! This guide will help you understand our development workflow and contribution process.

## Table of Contents

1. [Development Workflow](#development-workflow)
2. [Git Workflow](#git-workflow)
3. [Coding Standards](#coding-standards)
4. [Pull Request Process](#pull-request-process)
5. [Testing Guidelines](#testing-guidelines)
6. [Code Review](#code-review)

## Development Workflow

### 1. Setup Development Environment

**Prerequisites:**
- .NET 8 SDK
- Node.js 20+
- PostgreSQL 15
- Docker Desktop (recommended)
- Git

**Initial Setup:**
```bash
# Clone repository
git clone <repository-url>
cd AppTemplate

# Setup environment
cp .env.example .env
# Edit .env with your local configuration

# Start with Docker (recommended)
docker compose up -d --build

# Or run manually (see backend/README.md and frontend/README.md)
```

### 2. Choose Your Task

- Check existing issues in the repository
- Discuss new features with the team before starting
- Break large features into smaller, manageable tasks

### 3. Create Feature Branch

Follow our [Git Workflow](#git-workflow) for branch naming and management.

### 4. Develop & Test

**Backend Development:**
```bash
cd backend/src/Presentation/Gspe.Bpm.WebAPI
dotnet run

# Run tests
dotnet test
```

**Frontend Development:**
```bash
cd frontend
npm install
npm run dev

# Run linter
npm run lint
```

### 5. Commit Changes

Follow our [commit message conventions](#commit-message-format).

### 6. Create Pull Request

Follow our [PR process](#pull-request-process).

## Git Workflow

### Branch Naming Convention

```
<type>/<short-description>

Types:
- feature/  - New features
- fix/      - Bug fixes
- refactor/ - Code refactoring
- docs/     - Documentation changes
- test/     - Adding or updating tests
- chore/    - Maintenance tasks
```

**Examples:**
```bash
feature/add-password-reset
fix/user-department-assignment
refactor/clean-architecture-improvement
docs/update-api-documentation
```

### Branch Strategy

```
main (production)
  │
  └── develop (staging)
        │
        ├── feature/new-feature-1
        ├── feature/new-feature-2
        ├── fix/bug-fix-1
        └── refactor/code-cleanup
```

**Branches:**
- `main` - Production-ready code, auto-deploys to production
- `develop` - Integration branch, auto-deploys to staging
- `feature/*` - Feature branches (created from `develop`)
- `fix/*` - Bug fix branches (created from `develop`)
- `hotfix/*` - Emergency fixes (created from `main`, merged to both `main` and `develop`)

### Creating a Feature Branch

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Work on your feature...

# Push to remote
git push origin feature/your-feature-name
```

### Commit Message Format

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (formatting, missing semicolons, etc)
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance

**Examples:**
```
feat(user): add password reset endpoint

Add ability for users to reset their password via email.
Includes validation and email notification.

Closes #123

---

fix(department): resolve department assignment issue

Fix bug where users were not properly assigned
to departments during update.

Fixes #456

---

docs(readme): update deployment guide

Add docker-compose instructions for local development.
```

### Syncing with Develop

Keep your feature branch up to date:

```bash
# On your feature branch
git checkout feature/your-feature-name

# Fetch latest changes
git fetch origin

# Rebase on develop (preferred)
git rebase origin/develop

# Or merge develop (if rebase has conflicts)
git merge origin/develop

# Push changes (use --force-with-lease if rebased)
git push origin feature/your-feature-name --force-with-lease
```

## Coding Standards

### Backend (.NET)

**Follow Clean Architecture:**
- Domain: Pure business logic, no dependencies
- Application: Use cases, DTOs, interfaces
- Infrastructure: External concerns (DB, services)
- Presentation: Controllers, middleware

**Code Style:**
```csharp
// Use PascalCase for classes, methods, properties
public class User
{
    public long Id { get; set; }
    public string Username { get; set; }

    // Use camelCase for parameters and local variables
    public void UpdatePassword(string newPassword, string hashedPassword)
    {
        var validPassword = ValidatePassword(newPassword);
        // ...
    }
}

// Use meaningful names
// Good
public async Task<UserDto> CreateUser(CreateUserCommand command)

// Bad
public async Task<UserDto> Create(CreateUserCommand cmd)
```

**CQRS Pattern:**
```csharp
// Commands - modify state
public record CreateUserCommand : IRequest<UserDto>
{
    public string Username { get; init; }
    public string Email { get; init; }
}

// Queries - read state
public record GetUserByIdQuery(long Id) : IRequest<UserDto>;

// Handlers
public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserDto>
{
    // Implementation
}
```

**Validation:**
```csharp
// Use FluentValidation for request validation
public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.Username).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}
```

### Frontend (Vue 3)

**Component Structure:**
```vue
<template>
  <!-- Use semantic HTML -->
  <v-container>
    <v-row>
      <v-col>
        <UserCard :user="user" @update="handleUpdate" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

// Use composition API with script setup
const userStore = useUserStore()

// State
const loading = ref(false)

// Computed
const userCount = computed(() => userStore.users.length)

// Methods
const handleUpdate = async (data) => {
  loading.value = true
  try {
    await userStore.updateUser(data)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  userStore.fetchUsers()
})
</script>

<style scoped>
/* Component-specific styles */
</style>
```

**Naming Conventions:**
- Components: PascalCase (e.g., `UserCard.vue`)
- Composables: camelCase with `use` prefix (e.g., `useAuth.js`)
- Stores: camelCase (e.g., `useUserStore`)
- Files: kebab-case for non-components (e.g., `api-service.js`)

**State Management:**
```javascript
// Use Pinia for global state
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const users = ref([])

  async function fetchUsers() {
    // Implementation
  }

  return { users, fetchUsers }
})
```

### Database

**Naming Convention:**
- snake_case for all database objects
- Plural table names: `users`, `departments`, `notifications`
- Singular foreign keys: `department_id`, `user_id`

**Migrations:**
- Always test migrations locally before committing
- Provide both Up and Down migrations
- Never modify existing migrations after they're merged

## Pull Request Process

### Before Creating PR

**Checklist:**
- [ ] Code follows project coding standards
- [ ] All tests pass locally
- [ ] Added tests for new features
- [ ] Updated documentation if needed
- [ ] No merge conflicts with target branch
- [ ] Commit messages follow conventions

### Creating Pull Request

1. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR on GitHub:**
   - Navigate to repository
   - Click "New Pull Request"
   - Select base branch (`develop` or `main`)
   - Select your feature branch
   - Fill in PR template

3. **PR Title Format:**
   ```
   feat: Add password reset feature
   fix: Resolve user assignment bug
   docs: Update deployment guide
   ```

4. **PR Description Template:**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] New feature
   - [ ] Bug fix
   - [ ] Refactoring
   - [ ] Documentation update

   ## Changes Made
   - Added password reset endpoint
   - Updated user model
   - Added unit tests

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Manual testing performed
   - [ ] Tested in Docker environment

   ## Screenshots (if applicable)
   [Add screenshots for UI changes]

   ## Related Issues
   Closes #123
   Related to #456

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Tests pass locally
   - [ ] Documentation updated
   ```

### PR Review Process

1. **Automated Checks:**
   - CI/CD pipeline runs automatically
   - All checks must pass before merge

2. **Code Review:**
   - At least one approval required
   - Address reviewer comments
   - Update PR based on feedback

3. **Merging:**
   - Squash and merge (preferred)
   - Merge commit (for feature branches with multiple logical commits)
   - Rebase and merge (for clean history)

### After Merge

- Delete feature branch (both local and remote)
- Verify deployment to staging (if merged to `develop`)
- Monitor for any issues

```bash
# Delete local branch
git branch -d feature/your-feature-name

# Delete remote branch (usually done via GitHub UI)
git push origin --delete feature/your-feature-name
```

## Testing Guidelines

### Backend Testing

**Unit Tests:**
```csharp
[Fact]
public async Task Handle_ShouldCreateUser()
{
    // Arrange
    var context = CreateMockContext();
    var handler = new CreateUserCommandHandler(context, passwordHashService);
    var command = new CreateUserCommand { /* ... */ };

    // Act
    var result = await handler.Handle(command, CancellationToken.None);

    // Assert
    Assert.NotNull(result);
    Assert.Equal("testuser", result.Username);
}
```

**Test Coverage:**
- Aim for 80%+ code coverage
- Test happy paths and edge cases
- Mock external dependencies

**Running Tests:**
```bash
cd backend

# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test
dotnet test --filter "FullyQualifiedName~TestClassName.TestMethodName"
```

### Frontend Testing

**Component Tests (Future):**
```javascript
import { mount } from '@vue/test-utils'
import UserCard from '@/components/UserCard.vue'

describe('UserCard', () => {
  it('renders user name', () => {
    const wrapper = mount(UserCard, {
      props: {
        user: { id: 1, username: 'testuser' }
      }
    })
    expect(wrapper.text()).toContain('testuser')
  })
})
```

**Linting:**
```bash
cd frontend

# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint --fix
```

## Code Review

### For Reviewers

**What to Look For:**
- Code quality and readability
- Adherence to coding standards
- Proper error handling
- Security vulnerabilities
- Performance considerations
- Test coverage

**Review Guidelines:**
- Be constructive and respectful
- Explain the "why" behind suggestions
- Distinguish between required changes and suggestions
- Approve when all concerns are addressed

### For Authors

**Responding to Reviews:**
- Address all comments
- Ask for clarification if needed
- Update PR based on feedback
- Mark conversations as resolved when addressed
- Be open to suggestions

## Deployment Process

### Automatic Deployment

**Staging:**
```bash
# Merge to develop
git checkout develop
git merge feature/your-feature-name
git push origin develop

# Automatically deploys to staging via GitHub Actions
```

**Production:**
```bash
# Merge develop to main
git checkout main
git merge develop
git push origin main

# Automatically deploys to production via GitHub Actions
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guide.

## Additional Resources

### Documentation
- [README.md](./README.md) - Project overview
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [backend/README.md](./backend/README.md) - Backend development
- [frontend/README.md](./frontend/README.md) - Frontend development
- [CLAUDE.md](./CLAUDE.md) - Comprehensive project guide

### External Resources
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Vue 3 Style Guide](https://vuejs.org/style-guide/)
- [.NET Coding Conventions](https://docs.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions)

## Getting Help

- Create an issue for bugs or feature requests
- Ask in team chat for quick questions
- Review existing documentation
- Contact team lead for guidance

---

**Thank you for contributing!**

Your contributions help make this project better for everyone.
