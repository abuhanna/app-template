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

1. Update connection string in `appsettings.json`
2. Run migrations: `dotnet ef migrations add InitialCreate`
3. Update database: `dotnet ef database update`
4. Run the API: `dotnet run`

## Adding a New Feature

1. Create folder: `Features/YourFeature/`
2. Add entity, DTOs, repository, service, controller
3. Register in `Common/Extensions/ServiceCollectionExtensions.cs`
