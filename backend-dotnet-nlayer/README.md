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

1. Update connection string in `appsettings.json`
2. Run migrations: `dotnet ef migrations add InitialCreate`
3. Update database: `dotnet ef database update`
4. Run the API: `dotnet run`

## When to Use N-Layer

- Simple CRUD applications
- Admin panels and dashboards
- Quick prototypes and MVPs
- Small to medium team projects
- Applications with straightforward business logic
