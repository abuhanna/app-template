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

### Running with Docker

```bash
docker compose up -d --build
```
API: `http://localhost:5100`

### Running Tests

```bash
npm test
```

## Features

- **N-Layer Architecture**: Controller -> Service -> Repository
- **Global Exception Filter**: Standardized error responses
- **Logging Interceptor**: Request logging
- **Docker Support**: Ready to deploy
- **Unit Tests**: Jest setup included

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
