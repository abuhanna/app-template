# App.Template - Package by Feature Architecture

A .NET 8 Web API template using Package by Feature (modular) architecture.

## Architecture

```
src/App.Template.Api/
├── Features/
│   ├── Users/           # User management feature
│   │   ├── User.cs              # Entity
│   │   ├── UsersController.cs   # API Controller
│   │   ├── UserService.cs       # Business logic
│   │   ├── IUserService.cs      # Service interface
│   │   ├── UserRepository.cs    # Data access
│   │   ├── IUserRepository.cs   # Repository interface
│   │   └── Dtos/                # Feature-specific DTOs
│   ├── Products/        # Product feature (add your own)
│   └── Auth/            # Authentication feature
├── Common/              # Shared utilities only
│   ├── Exceptions/
│   └── Extensions/
└── Data/
    └── AppDbContext.cs
```

## Key Principles

1. **Feature Isolation**: Each feature folder contains ALL its code (entity, controller, service, repository, DTOs)
2. **Minimal Sharing**: Only truly cross-cutting concerns go in `Common/`
3. **Scalability**: Easy to add new features without touching existing code
4. **Team-Friendly**: Different team members can work on different features

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

- **Package by Feature**: Modular architecture
- **Global Exception Handling**: Centralized error handling middleware
- **Structured Logging**: Pre-configured logging
- **CORS Configured**: Ready for frontend integration
- **Docker Support**: Containerized for easy deployment
- **Unit Tests**: xUnit test project included

1. Create folder: `Features/YourFeature/`
2. Add entity, DTOs, repository, service, controller
3. Register in `Common/Extensions/ServiceCollectionExtensions.cs`
