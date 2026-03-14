# Architecture Patterns

This document explains the three architecture patterns available for every backend framework, with per-backend specifics.

---

## Overview

| Pattern | Complexity | Projects/Modules | Best For |
|---------|-----------|-------------------|----------|
| **Clean Architecture** | High | 4 separate layers | Large, complex systems with long lifetimes |
| **Feature-Based** | Medium | 1 project, feature folders | Rapid development, medium-sized apps |
| **N-Layer** | Low | 1 project, horizontal layers | Small to medium projects, simple CRUD |

---

## 1. Clean Architecture

### Dependency Flow

```
                    ┌─────────────────────┐
                    │    Presentation     │  ← Controllers, Middleware
                    │    (WebAPI / API)    │
                    └─────────┬───────────┘
                              │ depends on
                    ┌─────────▼───────────┐
                    │    Application      │  ← Use Cases, DTOs, Interfaces
                    │    (Business Logic)  │
                    └─────────┬───────────┘
                              │ depends on
                    ┌─────────▼───────────┐
                    │      Domain         │  ← Entities, Value Objects, Exceptions
                    │   (Core Business)   │
                    └─────────────────────┘
                              ▲
                              │ implements interfaces from Application
                    ┌─────────┴───────────┐
                    │   Infrastructure    │  ← DB, External Services, Repos
                    │  (Technical Details) │
                    └─────────────────────┘
```

**Key principle**: Dependencies point INWARD. Domain has zero dependencies. Infrastructure depends on Application (for interfaces) and Domain (for entities), but Application never depends on Infrastructure.

### When to Use
- Large teams working on the same codebase
- Long-lived projects requiring maintainability
- Complex business logic that benefits from isolation
- Projects needing comprehensive unit testing
- When you want to swap infrastructure (e.g., change database) without touching business logic

### .NET 8 — Clean Architecture

```
backend/dotnet/clean-architecture/{full,minimal}/
  src/
    Core/
      App.Template.Domain/          ← Entities, exceptions, value objects
      App.Template.Application/     ← CQRS handlers (MediatR), DTOs, interfaces
    Infrastructure/
      App.Template.Infrastructure/  ← EF Core DbContext, services, SignalR hub
    Presentation/
      App.Template.WebAPI/          ← Controllers, middleware, DI config
  tests/
    App.Template.Application.Tests/ ← Unit tests for handlers/validators
    App.Template.Domain.Tests/      ← Unit tests for domain logic
  App.Template.sln
```

**Key packages**: MediatR (CQRS), FluentValidation, EF Core
**CQRS pattern**: Commands/Queries → Handlers → return DTOs
**Domain models**: Rich (private setters, domain methods, validation)
**Repository**: No traditional repository — uses `IApplicationDbContext` interface

### Spring Boot 3 — Clean Architecture

```
backend/spring/clean-architecture/{full,minimal}/
  pom.xml (parent)
  domain/                    ← Domain entities (NO Spring dependencies)
    src/main/java/apptemplate/domain/
  application/               ← Use cases, DTOs, port interfaces, MapStruct
    src/main/java/apptemplate/application/
  infrastructure/            ← JPA entities, repository adapters, services
    src/main/java/apptemplate/infrastructure/
  api/                       ← REST controllers, security, middleware
    src/main/java/apptemplate/api/
    src/main/resources/db/migration/  ← Flyway SQL migrations
```

**Key packages**: MapStruct (DTO mapping), Lombok, Flyway (migrations), Bucket4j (rate limiting)
**Multi-module Maven**: Each layer is a separate Maven module
**Domain/ORM separation**: Domain entities are POJOs; JPA entities are in infrastructure
**Database**: PostgreSQL via Spring Data JPA, DDL strategy: `validate` (Flyway manages schema)
**Package naming**: `apptemplate.*` (no `com.` prefix) — CLI renames this

### NestJS — Clean Architecture

```
backend/nestjs/clean-architecture/{full,minimal}/
  src/
    modules/
      auth/
        application/commands/       ← CQRS command handlers
        application/queries/        ← CQRS query handlers
        domain/entities/            ← Domain entities
        infrastructure/services/    ← BCrypt, JWT services
        presentation/               ← Controllers
      user-management/
        domain/entities/user.entity.ts      ← Rich domain entity
        infrastructure/persistence/
          user.orm-entity.ts                ← TypeORM entity (separate)
        ...
    common/                         ← Shared filters, guards, pipes
```

**Key packages**: @nestjs/cqrs (CQRS), TypeORM, class-validator
**CQRS**: Commands and Queries dispatched through NestJS CQRS bus
**Domain/ORM separation**: Separate domain entities and ORM entities
**Database**: TypeORM + PostgreSQL, `synchronize: false`, TypeORM migrations
**Logging**: Pino via nestjs-pino

---

## 2. Feature-Based Architecture

### Folder Structure

```
                    ┌─────────────────────────┐
                    │      Single Project      │
                    │                          │
                    │  ┌───────┐ ┌───────────┐ │
                    │  │ Auth  │ │Departments│ │
                    │  │       │ │           │ │
                    │  │ Ctrl  │ │ Ctrl      │ │
                    │  │ Svc   │ │ Svc       │ │
                    │  │ DTOs  │ │ Entity    │ │
                    │  │       │ │ DTOs      │ │
                    │  └───────┘ └───────────┘ │
                    │                          │
                    │  ┌───────┐ ┌───────────┐ │
                    │  │ Users │ │   Files   │ │
                    │  │       │ │           │ │
                    │  │ Ctrl  │ │ Ctrl      │ │
                    │  │ Svc   │ │ Svc       │ │
                    │  │ Repo  │ │ Entity    │ │
                    │  │ Entity│ │ DTOs      │ │
                    │  │ DTOs  │ │           │ │
                    │  └───────┘ └───────────┘ │
                    │                          │
                    │  ┌──────────────────────┐ │
                    │  │    Common / Shared   │ │
                    │  │  DbContext, Entities │ │
                    │  │  Extensions, Utils   │ │
                    │  └──────────────────────┘ │
                    └─────────────────────────┘
```

**Key principle**: Code is organized by business feature, not by technical layer. Each feature folder contains its controller, service, DTOs, and optionally its entity.

### When to Use
- Medium-sized applications with clear feature boundaries
- Teams organized by feature/domain
- When you want faster development without CQRS overhead
- Projects where features are relatively independent

### .NET 8 — Feature Architecture

```
backend/dotnet/feature-architecture/{full,minimal}/
  src/App.Template.Api/
    Common/
      Entities/               ← Shared entities (User, AuditableEntity)
      Extensions/             ← DI registration (AddFeatureServices)
      Models/                 ← PagedResult, PaginationQuery
      Services/               ← JwtService, ExportService, etc.
    Features/
      AuditLogs/              ← Controller + Service + DTOs
      Auth/                   ← Controller + Service + DTOs
      Departments/            ← Entity + Controller + Service + DTOs
      Files/                  ← Entity + Controller + Service + DTOs
      Users/                  ← Entity + Controller + Service + Repository + DTOs
    Data/                     ← AppDbContext
```

**Key differences from Clean**:
- No MediatR/CQRS — controllers call services directly
- Only `UserRepository` exists; other features use `AppDbContext` directly
- Anemic domain models (public setters)
- Single project, no solution-level separation
- Service registration via `AddFeatureServices()` extension method

### Spring Boot 3 — Feature Architecture

```
backend/spring/feature-architecture/{full,minimal}/
  src/main/java/com/apptemplate/
    features/
      auth/                   ← Controller + Service + DTOs
      users/                  ← Entity + Controller + Service + DTOs
      departments/            ← Entity + Controller + Service + DTOs
      ...
    common/
      config/                 ← Security, Swagger, WebSocket config
      dto/                    ← Shared DTOs (PageResponse, etc.)
      entity/                 ← Base entities (AuditableEntity)
      security/               ← JWT filter, AuthenticationFacade
```

**Key differences from Clean**:
- Single Maven module (no multi-module)
- Spring Data JPA repositories per feature
- No MapStruct — manual DTO mapping
- Package naming: `com.apptemplate.*` (with `com.` prefix)

### NestJS — Feature Architecture

```
backend/nestjs/feature-architecture/{full,minimal}/
  src/
    features/
      auth/                   ← Module + Controller + Service + DTOs
      users/                  ← Module + Controller + Service + Entity + DTOs
      departments/            ← Module + Controller + Service + Entity + DTOs
      ...
    common/                   ← Guards, filters, pipes, decorators
    config/                   ← Database, JWT, app config
```

**Key differences from Clean**:
- No CQRS — services are injected directly into controllers
- No domain/ORM entity separation
- NestJS modules per feature with standard providers

---

## 3. N-Layer Architecture

### Layer Structure

```
    ┌─────────────────────────────────────┐
    │         Controllers Layer           │  ← API endpoints, request handling
    ├─────────────────────────────────────┤
    │          Services Layer             │  ← Business logic, orchestration
    ├─────────────────────────────────────┤
    │        Repositories Layer           │  ← Data access, queries
    ├─────────────────────────────────────┤
    │           Models Layer              │  ← Entities, DTOs, value objects
    ├─────────────────────────────────────┤
    │             Database                │  ← PostgreSQL
    └─────────────────────────────────────┘
```

**Key principle**: Code is organized by technical layer. All controllers together, all services together, all repositories together. Simple top-down dependency flow.

### When to Use
- Small to medium projects with straightforward CRUD
- Solo developers or small teams
- When simplicity and familiarity are priorities
- Prototypes or MVPs that may evolve later

### .NET 8 — N-Layer Architecture

```
backend/dotnet/nlayer-architecture/{full,minimal}/
  src/App.Template.Api/
    Controllers/              ← All controllers
    Services/                 ← All services + interfaces
    Repositories/             ← All repositories + interfaces (6 total)
    Models/
      Entities/               ← All entities
      Dtos/                   ← All DTOs
      Common/                 ← PagedResult, PaginationQuery
    Data/                     ← AppDbContext
    Extensions/               ← AddApplicationServices()
    Middleware/               ← Exception handling
```

**Key differences from Feature-arch**:
- ALL entities get repositories (6 repositories vs. Feature's 1)
- Service registration via `AddApplicationServices()` extension method
- Namespace: `App.Template.Api.Models.Common` (vs Feature's `App.Template.Api.Common.Models`)

### Spring Boot 3 — N-Layer Architecture

```
backend/spring/nlayer-architecture/{full,minimal}/
  src/main/java/com/apptemplate/
    controller/               ← All REST controllers
    service/                  ← All services + interfaces
    repository/               ← All Spring Data JPA repositories
    model/
      entity/                 ← All entities
      dto/                    ← All DTOs
    security/                 ← JWT, auth config
    config/                   ← Spring configuration
```

**Nearly identical code** to Feature-arch, just organized horizontally instead of by feature.

### NestJS — N-Layer Architecture

```
backend/nestjs/nlayer-architecture/{full,minimal}/
  src/
    controllers/              ← All controllers
    services/                 ← All services
    repositories/             ← All custom repositories
    entities/                 ← All TypeORM entities
    dto/                      ← All DTOs
    guards/                   ← Auth guards
    config/                   ← Configuration
```

**Flattest structure** — all files in top-level technical folders.

---

## Cross-Architecture Comparison

| Concern | Clean | Feature-Based | N-Layer |
|---------|-------|---------------|---------|
| **Projects/Modules** | 4 (.NET), 4 (Spring), modules (NestJS) | 1 | 1 |
| **CQRS/MediatR** | Yes (.NET, NestJS) | No | No |
| **Repository pattern** | Interface-based (IApplicationDbContext) | Minimal (UserRepo only in .NET) | All entities |
| **Domain models** | Rich (private setters, methods) | Anemic (public setters) | Anemic |
| **DTO mapping** | MediatR handlers / MapStruct | Manual in services | Manual in services |
| **Test isolation** | High (mockable interfaces) | Medium | Medium |
| **Onboarding time** | Higher | Lower | Lowest |
| **Refactoring cost** | Low (well-isolated) | Medium | Higher (cross-cutting) |
| **Feature colocation** | No (spread across layers) | Yes | No (spread across layers) |

---

## Choosing an Architecture

```
Is your project large or complex?
  ├── Yes → Clean Architecture
  └── No
       │
       Is your team organized by features/domains?
       ├── Yes → Feature-Based Architecture
       └── No
            │
            Is this a simple CRUD app or prototype?
            ├── Yes → N-Layer Architecture
            └── No → Feature-Based Architecture (safe default)
```

### Migration Path

Projects can evolve between architectures:
- **N-Layer → Feature-Based**: Group files by feature folder (low effort)
- **Feature-Based → Clean**: Extract domain layer, add CQRS, define interfaces (medium effort)
- **Clean → Feature-Based**: Not recommended (losing structure rarely helps)
