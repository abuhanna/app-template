# AppTemplate - Scaffolding Generator Source

This repository contains the source code for the [`@abuhannaa/create-apptemplate`](https://www.npmjs.com/package/@abuhannaa/create-apptemplate) scaffolding generator. It includes the CLI tool itself and the reference template implementations for .NET, Spring Boot, NestJS, and Vue 3.

> **Note**: If you simply want to **create a new project**, you do not need to clone this repository. Use the NPM command below.

## Usages (Generating a New Project)

To scaffold a new application using the latest templates:

```bash
npm create @abuhannaa/apptemplate@latest
```

The interactive CLI will guide you through:
1.  **Project Name**: The name of your new application.
2.  **Project Type**: Fullstack, Backend Only, or Frontend Only.
3.  **Backend Framework**: .NET 8, Spring Boot 3, or NestJS.
4.  **Frontend Framework**: Vue 3.
5.  **UI Library**: Vuetify (Material) or PrimeVue.

### Non-Interactive Mode

You can also specify options via command-line arguments:

```bash
# Create a .NET + Vuetify Fullstack App
npm create @abuhannaa/apptemplate@latest my-app -- --template fullstack --backend dotnet --frontend vue --ui vuetify

# Create a Spring Boot API
npm create @abuhannaa/apptemplate@latest my-api -- --template backend --backend spring
```

---

## Repository Structure

This monorepo serves as the source of truth for the templates used by the generator:

*   **`create-apptemplate/`**: Source code for the CLI tool.
*   **`backend-dotnet/`**: Reference template for .NET 8 WebAPI (Clean Architecture).
*   **`backend-spring/`**: Reference template for Spring Boot 3 (Clean Architecture).
*   **`backend-nestjs/`**: Reference template for NestJS (CQRS).
*   **`frontend-vuetify/`**: Reference template for Vue 3 + Vuetify.
*   **`frontend-primevue/`**: Reference template for Vue 3 + PrimeVue.
*   **`docker/`**: Shared Docker configurations and Nginx setups.

---

## Developing the Templates

The following instructions are for **contributors** to this repository or for testing the templates locally within this monorepo.

### Quick Start (Local Monorepo)

**Using Docker (Recommended)**

```bash
# 1. Clone repository
git clone https://github.com/abuhannaa/app-template.git
cd fullstack-dotnet-vue

# 2. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 3. Start services (Fullstack .NET + Vuetify by default)
docker compose up -d --build
```

**Access Points:**
*   Frontend: http://localhost
*   Backend API: http://localhost:5100
*   Swagger UI: http://localhost:5100/swagger
*   Database: localhost:5432

### Manual Development

**Backend (.NET):**
```bash
cd backend-dotnet/src/Presentation/App.Template.WebAPI
dotnet run
```

**Frontend (Vuetify):**
```bash
cd frontend-vuetify
npm install
npm run dev
```

---

## Template Features & Tech Stack

The generated applications include the following features and technologies:

### Features
*   **Authentication**: JWT-based system with Refresh Tokens.
*   **User Management**: Role-based access control (RBAC).
*   **Department Management**: Organizational hierarchy.
*   **Real-time Notifications**: SignalR (.NET) / WebSocket integration.
*   **Clean Architecture**: Separation of concerns for maintainability.

### Backend Options
*   **.NET 8**: EF Core, MediatR, FluentValidation, PostgreSQL.
*   **Spring Boot 3**: Java 17+, JPA/Hibernate, Spring Security.
*   **NestJS**: TypeScript, TypeORM, CQRS.

### Frontend Options
*   **Vue 3**: Composition API, Pinia, Vite.
*   **UI Libraries**:
    *   **Vuetify 3**: Material Design system.
    *   **PrimeVue**: Comprehensive UI suite.

### Infrastructure
*   **Docker**: Containerized services.
*   **Nginx**: Reverse proxy configuration.
*   **GitHub Actions**: CI/CD pipelines included.

---

## Documentation Links

For detailed documentation on specific templates:

| Module | Documentation |
|:---|:---|
| **.NET Backend** | [Read More](./backend-dotnet/README.md) |
| **Vue + Vuetify** | [Read More](./frontend-vuetify/README.md) |
| **Deployment** | [Read More](./DEPLOYMENT.md) |
| **Contributing** | [Read More](./CONTRIBUTING.md) |
