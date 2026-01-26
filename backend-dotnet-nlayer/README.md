# App.Template - N-Layer Architecture

A .NET 8 Web API template using traditional N-Layer (3-Tier) architecture.

## Architecture

```
src/App.Template.Api/
├── Controllers/     # API Controllers (Presentation Layer)
├── Services/        # Business Logic Layer
├── Repositories/    # Data Access Layer
├── Models/
│   ├── Entities/    # Database entities with EF Core annotations
│   └── Dtos/        # Data Transfer Objects
├── Data/            # DbContext and migrations
├── Middleware/      # Custom middleware
└── Extensions/      # Service registration extensions
```

## Getting Started

### Prerequisites
- .NET 8 SDK
- SQL Server (local or via Docker) or Docker Desktop for containerized run

### Running Locally

1. Update connection string in `src/App.Template.Api/appsettings.json`
2. Run migrations:
   ```bash
   dotnet ef migrations add InitialCreate --project src/App.Template.Api/App.Template.Api.csproj
   dotnet ef database update --project src/App.Template.Api/App.Template.Api.csproj
   ```
3. Run the API:
   ```bash
   dotnet run --project src/App.Template.Api/App.Template.Api.csproj
   ```
   Or navigate to project folder:
   ```bash
   cd src/App.Template.Api
   dotnet run
   ```

### Running with Docker

```bash
docker compose up -d --build
```
API will be available at `http://localhost:5100`.

### Running Tests

```bash
dotnet test
```

## Features

- **N-Layer Architecture**: Separation of concerns (Presentation, Business, Data)
- **Global Exception Handling**: Centralized error handling middleware
- **Structured Logging**: Pre-configured logging
- **CORS Configured**: Ready for frontend integration
- **Docker Support**: Containerized for easy deployment
- **Unit Tests**: xUnit test project included

- Simple CRUD applications
- Admin panels and dashboards
- Quick prototypes and MVPs
- Small to medium team projects
- Applications with straightforward business logic
