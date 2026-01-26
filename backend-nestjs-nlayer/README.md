# App.Template - NestJS N-Layer Architecture

A NestJS API template using traditional N-Layer (3-Tier) architecture.

## Architecture

```
src/
├── controllers/     # API Controllers (Presentation Layer)
├── services/        # Business Logic Layer
├── repositories/    # Data Access Layer
├── entities/        # TypeORM entities with decorators
└── dtos/            # Data Transfer Objects
```

## Getting Started

1. Install dependencies: `npm install`
2. Configure database in `app.module.ts` or via environment variables
3. Run the API: `npm run start:dev`

## Environment Variables

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=apptemplate
```

## When to Use N-Layer

- Simple CRUD applications
- Admin panels and dashboards
- Quick prototypes and MVPs
- Teams familiar with traditional architecture
