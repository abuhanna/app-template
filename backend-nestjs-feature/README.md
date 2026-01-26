# App.Template - NestJS Package by Feature Architecture

A NestJS API template using Package by Feature (modular) architecture.

## Architecture

```
src/
├── features/
│   └── users/           # User feature module
│       ├── users.module.ts
│       ├── users.controller.ts
│       ├── user.service.ts
│       ├── user.repository.ts
│       ├── user.entity.ts
│       └── dtos/
│           └── user.dto.ts
└── common/              # Shared utilities
```

## Key Principles

1. **Feature Isolation**: Each feature is a complete NestJS module
2. **Self-Contained**: Controller, service, repository, entity all in one folder
3. **Easy to Scale**: Add new features without touching existing code

## Getting Started

1. Install dependencies: `npm install`
2. Configure database via environment variables
3. Run the API: `npm run start:dev`

## Adding a New Feature

1. Create folder: `src/features/your-feature/`
2. Create module, controller, service, repository, entity
3. Import module in `app.module.ts`
