# Backend - AppTemplate API

.NET 8 RESTful API with Clean Architecture and CQRS pattern for the AppTemplate scaffolding project.

## Tech Stack

- **.NET 8.0** - Latest LTS version
- **Entity Framework Core** - ORM for PostgreSQL
- **MediatR** - CQRS pattern implementation
- **FluentValidation** - Request validation
- **PostgreSQL 15** - Primary database
- **Swagger/OpenAPI** - API documentation
- **JWT** - Authentication (local + optional SSO)
- **BCrypt** - Password hashing
- **SignalR** - Real-time notifications

## Project Structure (Clean Architecture)

```
backend/
├── src/
│   ├── Core/
│   │   ├── Gspe.Bpm.Domain/              # Entities, Enums (namespace: AppTemplate.Domain)
│   │   │   ├── Entities/                 # User, Department, Notification
│   │   │   └── Enums/                    # NotificationType
│   │   │
│   │   └── Gspe.Bpm.Application/         # Use Cases, Interfaces, DTOs (namespace: AppTemplate.Application)
│   │       ├── Features/                 # CQRS Commands & Queries
│   │       │   ├── Authentication/       # Login, Logout, GetCurrentUser
│   │       │   ├── UserManagement/       # User CRUD, ChangePassword
│   │       │   ├── DepartmentManagement/ # Department CRUD
│   │       │   └── NotificationManagement/
│   │       ├── DTOs/                     # Data Transfer Objects
│   │       └── Interfaces/               # Service interfaces
│   │
│   ├── Infrastructure/
│   │   └── Gspe.Bpm.Infrastructure/      # External Concerns (namespace: AppTemplate.Infrastructure)
│   │       ├── Persistence/              # EF Core DbContext
│   │       │   ├── DataContext/
│   │       │   └── Migrations/
│   │       ├── Services/                 # Service implementations
│   │       │   ├── PasswordHashService   # BCrypt password hashing
│   │       │   ├── JwtTokenService       # JWT generation
│   │       │   ├── SsoAuthService        # Optional SSO integration
│   │       │   └── NotificationService   # SignalR notifications
│   │       └── Hubs/                     # SignalR hubs
│   │
│   └── Presentation/
│       └── Gspe.Bpm.WebAPI/              # ASP.NET Core Web API (namespace: AppTemplate.WebAPI)
│           ├── Controllers/              # API endpoints
│           ├── Middleware/               # Custom middleware
│           └── Program.cs                # Application entry point
│
└── tests/
    ├── Gspe.Bpm.Domain.Tests/
    └── Gspe.Bpm.Application.Tests/
```

**Note**: Folder names use `Gspe.Bpm.*` but namespaces are `AppTemplate.*` (configured via .csproj).

## Quick Start

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [PostgreSQL 15+](https://www.postgresql.org/download/)

### Setup

1. **Navigate to WebAPI project**
   ```bash
   cd backend/src/Presentation/Gspe.Bpm.WebAPI
   ```

2. **Create appsettings.Development.json**
   ```bash
   cp appsettings.example.json appsettings.Development.json
   ```

3. **Configure Database Connection**

   Edit `appsettings.Development.json`:
   ```json
   {
     "ConnectionStrings": {
       "BpmDb": "Host=localhost;Port=5432;Database=apptemplate_dev;Username=postgres;Password=your_password"
     },
     "Jwt": {
       "Secret": "your-secret-key-minimum-32-characters-long",
       "Issuer": "AppTemplate",
       "Audience": "AppTemplate"
     },
     "Sso": {
       "BaseUrl": ""
     }
   }
   ```

4. **Run the API**
   ```bash
   dotnet run
   ```

   Access:
   - API: http://localhost:5100
   - Swagger UI: http://localhost:5100/swagger
   - Health Check: http://localhost:5100/health

### Default Admin User

The database is seeded with an admin user:
- **Username**: `admin`
- **Password**: `Admin@123`
- **Role**: `Admin`

## Development Commands

### Build & Run

```bash
# Restore dependencies
dotnet restore

# Build solution
dotnet build

# Run API
dotnet run --project src/Presentation/Gspe.Bpm.WebAPI

# Clean build artifacts
dotnet clean
```

### Testing

```bash
# Run all tests
dotnet test

# Run specific test project
dotnet test tests/Gspe.Bpm.Application.Tests

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test method
dotnet test --filter "FullyQualifiedName~YourTestClass.YourTestMethod"
```

### Code Quality

```bash
# Format code
dotnet format

# Analyze code
dotnet build /p:TreatWarningsAsErrors=true
```

## Database Migrations

### Auto-Migration (Development)

Migrations are **automatically applied** when running in Development environment. Just start the app:
```bash
dotnet run --project src/Presentation/Gspe.Bpm.WebAPI
```

### Manual Migration Commands

**Add New Migration:**
```bash
dotnet ef migrations add MigrationName \
  --project src/Infrastructure/Gspe.Bpm.Infrastructure \
  --startup-project src/Presentation/Gspe.Bpm.WebAPI
```

**Apply Migrations:**
```bash
dotnet ef database update \
  --project src/Infrastructure/Gspe.Bpm.Infrastructure \
  --startup-project src/Presentation/Gspe.Bpm.WebAPI
```

**Remove Last Migration:**
```bash
dotnet ef migrations remove \
  --project src/Infrastructure/Gspe.Bpm.Infrastructure \
  --startup-project src/Presentation/Gspe.Bpm.WebAPI
```

**Reset Database (WARNING: Deletes all data):**
```bash
dotnet ef database drop \
  --project src/Infrastructure/Gspe.Bpm.Infrastructure \
  --startup-project src/Presentation/Gspe.Bpm.WebAPI

dotnet ef database update \
  --project src/Infrastructure/Gspe.Bpm.Infrastructure \
  --startup-project src/Presentation/Gspe.Bpm.WebAPI
```

### Adding New Entity Fields

**Option 1: Nullable field (recommended for existing data)**
```csharp
public string? NewField { get; set; }
```

**Option 2: Non-nullable with default**
```csharp
public string NewField { get; set; } = "default_value";
```

After modifying entity, create migration:
```bash
dotnet ef migrations add AddNewField \
  --project src/Infrastructure/Gspe.Bpm.Infrastructure \
  --startup-project src/Presentation/Gspe.Bpm.WebAPI
```

## Architecture Patterns

### Clean Architecture Layers

**1. Domain Layer** (`AppTemplate.Domain`)
- Core business entities
- No dependencies on other layers
- No infrastructure concerns

**2. Application Layer** (`AppTemplate.Application`)
- Use cases (Commands & Queries)
- DTOs
- Interface definitions
- Validation logic
- Depends on Domain layer only

**3. Infrastructure Layer** (`AppTemplate.Infrastructure`)
- Database implementation (EF Core)
- External service implementations
- Depends on Application layer

**4. Presentation Layer** (`AppTemplate.WebAPI`)
- Controllers
- Middleware
- Depends on Application layer

### CQRS Pattern with MediatR

**Commands** - Modify state
```csharp
// Command
public record CreateUserCommand : IRequest<UserDto>
{
    public string Username { get; init; }
    public string Email { get; init; }
    public string Password { get; init; }
    public string? Name { get; init; }
    public string? Role { get; init; }
    public long? DepartmentId { get; init; }
}

// Handler
public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserDto>
{
    private readonly IBpmDbContext _context;
    private readonly IPasswordHashService _passwordHashService;

    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken ct)
    {
        var passwordHash = _passwordHashService.HashPassword(request.Password);
        var user = new User(
            request.Username,
            request.Email,
            passwordHash,
            request.Name,
            request.Role,
            request.DepartmentId
        );

        _context.Users.Add(user);
        await _context.SaveChangesAsync(ct);

        return new UserDto { /* ... */ };
    }
}
```

**Queries** - Read state
```csharp
// Query
public record GetUserByIdQuery(long Id) : IRequest<UserDto?>;

// Handler
public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, UserDto?>
{
    private readonly IBpmDbContext _context;

    public async Task<UserDto?> Handle(GetUserByIdQuery request, CancellationToken ct)
    {
        var user = await _context.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == request.Id, ct);

        return user == null ? null : new UserDto { /* ... */ };
    }
}
```

## Adding New Features

### Step-by-Step Guide (Example: Adding "Product" Entity)

**1. Domain Layer**

Create entity in `Domain/Entities/Product.cs`:
```csharp
public class Product
{
    public long Id { get; private set; }
    public string Name { get; private set; }
    public decimal Price { get; private set; }
    public bool IsActive { get; private set; }

    private Product() { } // EF Core

    public Product(string name, decimal price)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required", nameof(name));
        if (price < 0)
            throw new ArgumentException("Price must be positive", nameof(price));

        Name = name;
        Price = price;
        IsActive = true;
    }

    public void Update(string name, decimal price)
    {
        Name = name;
        Price = price;
    }
}
```

**2. Application Layer**

Add `DbSet<Product>` to `IBpmDbContext.cs`:
```csharp
public interface IBpmDbContext
{
    DbSet<Product> Products { get; }
    // ... other DbSets
}
```

Create DTO in `Application/DTOs/ProductDto.cs`:
```csharp
public record ProductDto(long Id, string Name, decimal Price, bool IsActive);
```

Create Command in `Application/Features/ProductManagement/Commands/CreateProduct/`:
```csharp
// CreateProductCommand.cs
public record CreateProductCommand : IRequest<ProductDto>
{
    public string Name { get; init; } = string.Empty;
    public decimal Price { get; init; }
}

// CreateProductCommandHandler.cs
public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, ProductDto>
{
    private readonly IBpmDbContext _context;

    public CreateProductCommandHandler(IBpmDbContext context)
    {
        _context = context;
    }

    public async Task<ProductDto> Handle(CreateProductCommand request, CancellationToken ct)
    {
        var product = new Product(request.Name, request.Price);

        _context.Products.Add(product);
        await _context.SaveChangesAsync(ct);

        return new ProductDto(product.Id, product.Name, product.Price, product.IsActive);
    }
}
```

**3. Infrastructure Layer**

Add `DbSet<Product>` to `BpmDbContext.cs`:
```csharp
public class BpmDbContext : DbContext, IBpmDbContext
{
    public DbSet<Product> Products { get; set; }
    // ... other DbSets

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
        });

        // Call this LAST for snake_case naming
        modelBuilder.UseSnakeCaseNamingConvention();
    }
}
```

Create migration:
```bash
dotnet ef migrations add AddProductEntity \
  --project src/Infrastructure/Gspe.Bpm.Infrastructure \
  --startup-project src/Presentation/Gspe.Bpm.WebAPI
```

**4. Presentation Layer**

Create controller in `WebAPI/Controllers/ProductsController.cs`:
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateProductCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(long id)
    {
        var result = await _mediator.Send(new GetProductByIdQuery(id));
        return result != null ? Ok(result) : NotFound();
    }
}
```

**5. Run Migration**
```bash
# Auto-applied in Development when you run the app
dotnet run --project src/Presentation/Gspe.Bpm.WebAPI
```

Done! New endpoints available:
- `POST /api/products`
- `GET /api/products/{id}`

## Authentication & Authorization

### Hybrid Authentication System

AppTemplate supports both local database authentication and optional SSO integration:

1. **Local Authentication** (default): Users stored in PostgreSQL with BCrypt password hashing
2. **SSO Integration** (optional): Proxy to external SSO server if configured

### JWT Configuration

Configuration in `appsettings.json`:
```json
{
  "Jwt": {
    "Secret": "your-secret-key-minimum-32-characters-long",
    "Issuer": "AppTemplate",
    "Audience": "AppTemplate",
    "ExpirationMinutes": 60
  },
  "Sso": {
    "BaseUrl": ""
  }
}
```

- Leave `Sso:BaseUrl` empty to use local authentication only
- Set it to your SSO server URL for hybrid authentication

### Protected Endpoints

All controllers are protected with `[Authorize]` attribute. To access:

1. Login: `POST /api/auth/login` with username/password
2. Get JWT token from response
3. Include token in requests: `Authorization: Bearer {token}`

### Role-Based Access

```csharp
// Admin only endpoint
[Authorize(Roles = "Admin")]
[HttpPost]
public async Task<IActionResult> CreateUser(CreateUserCommand command)
{
    // ...
}
```

### Current User Context

Access current user via `ICurrentUserService`:
```csharp
public class MyCommandHandler
{
    private readonly ICurrentUserService _currentUser;

    public async Task Handle()
    {
        var userId = _currentUser.UserId;
        var username = _currentUser.Username;
        var role = _currentUser.Role;
    }
}
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (returns JWT token)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user info

### Users (Admin only)
- `GET /api/users` - List all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `PUT /api/users/{id}/password` - Change password

### Departments
- `GET /api/departments` - List all departments
- `GET /api/departments/{id}` - Get department by ID
- `POST /api/departments` - Create department
- `PUT /api/departments/{id}` - Update department
- `DELETE /api/departments/{id}` - Delete department

### Notifications
- `GET /api/notifications` - Get user's notifications
- `PUT /api/notifications/{id}/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

## Testing

### Unit Tests Structure

```
tests/
├── Gspe.Bpm.Domain.Tests/
│   └── Entities/
│       ├── UserTests.cs
│       └── DepartmentTests.cs
│
└── Gspe.Bpm.Application.Tests/
    └── Features/
        └── UserManagement/
            └── Commands/
                └── CreateUserCommandHandlerTests.cs
```

### Example Test

```csharp
public class CreateUserCommandHandlerTests
{
    [Fact]
    public async Task Handle_ShouldCreateUser()
    {
        // Arrange
        var context = CreateMockContext();
        var passwordHashService = new Mock<IPasswordHashService>();
        passwordHashService.Setup(x => x.HashPassword(It.IsAny<string>()))
            .Returns("hashed_password");

        var handler = new CreateUserCommandHandler(context, passwordHashService.Object);
        var command = new CreateUserCommand
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "Password123"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("testuser", result.Username);
    }
}
```

## Troubleshooting

### Common Issues

**"No DbContext was found"**
- Ensure using both `--project` and `--startup-project` in EF commands

**"Connection string not found"**
- Create `appsettings.Development.json` from `appsettings.example.json`
- Verify connection string format

**JWT authentication fails**
- Verify `Jwt:Secret` is at least 32 characters
- Check token expiration
- Review logs for signature validation errors

**Migration already applied**
- Use `dotnet ef migrations remove` before adding new one

**Table naming is wrong**
- Ensure `UseSnakeCaseNamingConvention()` called LAST in `OnModelCreating()`

### Database Issues

**Connection failed**
- Verify PostgreSQL is running
- Check connection string credentials
- Ensure database exists

**Migration fails**
- Check database connectivity
- Verify migration files in `Infrastructure/Migrations/`
- Drop and recreate: `dotnet ef database drop && dotnet ef database update`

## Key Concepts

### Primary Key Strategy
- **BIGINT auto-increment** (PostgreSQL BIGSERIAL)
- All entity IDs are `long` type in C#
- `ValueGeneratedOnAdd()` configured in DbContext

### Naming Convention
- **Database**: snake_case (e.g., `users`, `department_id`)
- **C# Code**: PascalCase (e.g., `User`, `DepartmentId`)
- Auto-conversion via `UseSnakeCaseNamingConvention()`

### Domain Patterns
- Rich domain models with business logic
- Private setters and readonly collections
- Public constructors enforce invariants
- Private parameterless constructor for EF Core

## Additional Resources

- [Clean Architecture Guide](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [MediatR Documentation](https://github.com/jbogard/MediatR)
- [EF Core Documentation](https://docs.microsoft.com/en-us/ef/core/)
- [FluentValidation Documentation](https://docs.fluentvalidation.net/)

## Related Documentation

- See root `README.md` for monorepo overview
- See `CLAUDE.md` for comprehensive development guide

---

**Questions?** Check the troubleshooting section or create an issue.
