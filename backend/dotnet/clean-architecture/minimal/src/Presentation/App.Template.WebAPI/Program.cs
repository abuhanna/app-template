using System.Text;

using AspNetCoreRateLimit;

using Serilog;

using FluentValidation;

using AppTemplate.Application.Common.Behaviors;
using AppTemplate.Application.Interfaces;
using AppTemplate.Infrastructure.Hubs;
using AppTemplate.Infrastructure.SignalR;
using AppTemplate.Infrastructure.Persistence.DataContext;
using AppTemplate.Infrastructure.Services;
using AppTemplate.WebAPI.Configuration;
using AppTemplate.WebAPI.Middleware;

using MediatR;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.IdentityModel.Logging;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Validate environment configuration early (fail-fast)
EnvironmentValidator.Validate(builder.Configuration);

// Configure Serilog with enhanced enrichment for production tracing
builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithEnvironmentName()
    .Enrich.WithProperty("Application", "AppTemplate")
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] [{CorrelationId}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File(new Serilog.Formatting.Compact.RenderedCompactJsonFormatter(), "logs/log-.json",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 60));

builder.Services.AddControllers();
// Add SignalR with custom UserIdProvider
builder.Services.AddSignalR();
builder.Services.AddSingleton<Microsoft.AspNetCore.SignalR.IUserIdProvider, CustomUserIdProvider>();

// Add HttpContextAccessor for ICurrentUserService
builder.Services.AddHttpContextAccessor();
builder.Services.AddMemoryCache();

// Configure Rate Limiting
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
builder.Services.AddInMemoryRateLimiting();

// Add DbContext (EF Core)
// The connection string can be configured via appsettings.json or environment variables
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString)
           .UseSnakeCaseNamingConvention());

// Register the DbContext interface
builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

// Configure JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("JWT Secret not configured in appsettings.json");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "AppTemplate";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "AppTemplate";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        // For this SSO, only check expiration and signature
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = JwtTokenService.ResolveSigningKey(jwtSecret),
        // If token doesn't include 'kid', try the provided key
        TryAllIssuerSigningKeys = true,
        ClockSkew = TimeSpan.Zero // Remove default 5 minute tolerance
    };

    // Log authentication failures for debugging
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError(context.Exception, "JWT Authentication failed");

            if (context.Exception is Microsoft.IdentityModel.Tokens.SecurityTokenInvalidSignatureException)
            {
                logger.LogError("Signature validation failed. Ensure the JWT secret in configuration matches the one used by the SSO to sign the token.");
            }
            if (context.Exception is Microsoft.IdentityModel.Tokens.SecurityTokenSignatureKeyNotFoundException)
            {
                logger.LogError("Signature key not found. The token may be missing a 'kid' header, or the key is not configured correctly on the server.");
            }

            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            var userId = context.Principal?.FindFirst("sub")?.Value ?? context.Principal?.FindFirst("userId")?.Value;
            logger.LogInformation("JWT Token validated for user: {UserId}", userId);
            return Task.CompletedTask;
        },
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];

            // If the request is for our hub...
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/hubs")))
            {
                var env = context.HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>();
                if (env.IsDevelopment() || env.IsStaging())
                {
                    var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                    logger.LogInformation("Extracting access_token from query string for SignalR hub request to {Path}", path);
                }
                
                // Read the token out of the query string
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// Register MediatR (CQRS) and Validation Pipeline
builder.Services.AddValidatorsFromAssembly(typeof(IApplicationDbContext).Assembly);
builder.Services.AddMediatR(cfg => 
    cfg.RegisterServicesFromAssembly(typeof(IApplicationDbContext).Assembly));
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));


// Register Infrastructure Services
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<ISsoAuthService, SsoAuthService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IFileStorageService, FileStorageService>();
builder.Services.AddScoped<IExportService, ExportService>();

// Register Correlation ID accessor for request tracing
builder.Services.AddScoped<ICorrelationIdAccessor, CorrelationIdAccessor>();

// Add Swagger/OpenAPI with API Versioning support and JWT
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "AppTemplate API",
        Version = "v1",
        Description = "RESTful API for Application Template",
        Contact = new OpenApiContact
        {
            Name = "Development Team",
            Email = "dev@apptemplate.com"
        }
    });

    // Add JWT Authentication to Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Enter your token in the text input below.\n\nExample: \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\""
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    // Include XML comments if available
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

// Add CORS policy for development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(origin => true) // Allow any origin but with credentials support
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// --- Middleware Configuration ---

var app = builder.Build();

// Auto-migrate database in all environments
// Enable detailed identity model errors for local debugging only
if (app.Environment.IsDevelopment())
{
    IdentityModelEventSource.ShowPII = true;
}

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        // Safely apply migrations one by one. If a migration fails because a table/column already exists
        // (common when sharing a database across architectures), mark it as applied and continue.
        var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync();
        var migrator = ((Microsoft.EntityFrameworkCore.Infrastructure.IInfrastructure<IServiceProvider>)dbContext.Database).Instance.GetRequiredService<Microsoft.EntityFrameworkCore.Migrations.IMigrator>();

        foreach (var migration in pendingMigrations)
        {
            try
            {
                await migrator.MigrateAsync(migration);
            }
            catch (Npgsql.PostgresException ex) when (ex.SqlState == "42P07" || ex.SqlState == "42701" || ex.SqlState == "42710")
            {
                app.Logger.LogWarning("Migration {Migration} failed because an object already exists (SqlState: {SqlState}). Marking as applied.", migration, ex.SqlState);
                var sql = $"INSERT INTO \"__EFMigrationsHistory\" (migration_id, product_version) VALUES ('{migration}', '8.0.0') ON CONFLICT DO NOTHING;";
                await dbContext.Database.ExecuteSqlRawAsync(sql);
            }
        }

        app.Logger.LogInformation("Database migrations applied successfully in {Environment} environment.",
            app.Environment.EnvironmentName);

    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "An error occurred while migrating the database.");
        throw; // Fail startup if migration fails
    }
}

// Enable Swagger only in Development and Staging
if (app.Environment.IsDevelopment() || app.Environment.IsStaging())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "AppTemplate API v1");
        options.RoutePrefix = "swagger";
        options.DocumentTitle = "AppTemplate API Documentation";
    });
}

// Add Correlation ID middleware (should be first for request tracing)
app.UseCorrelationId();

// Add middleware for Exception Handling (recommended for production)
app.UseMiddleware<ExceptionHandlerMiddleware>();

// Add Rate Limiting middleware
app.UseIpRateLimiting();

// Configure HTTPS Redirection
// Active only in Production or if ASPNETCORE_URLS contains https
if (app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}
else
{
    // In Development, only use HTTPS redirection if the URL contains https
    var urls = builder.Configuration["ASPNETCORE_URLS"] ?? "";
    if (urls.Contains("https://", StringComparison.OrdinalIgnoreCase))
    {
        app.UseHttpsRedirection();
    }
}
app.UseCors("AllowAll");
// Add authentication middleware (required for ICurrentUserService)
app.UseAuthentication();
app.UseAuthorization();

// Add Request Logging middleware (after auth so we can log user info)
app.UseRequestLogging();

// Map root endpoint for API information
app.MapGet("/", () => Results.Ok(new
{
    name = "AppTemplate API",
    version = "1.0.0",
    description = "RESTful API for Application Template",
    documentation = app.Environment.IsDevelopment() ? "/swagger" : null,
    status = "Running",
    environment = app.Environment.EnvironmentName,
    features = new[]
    {
        "Authentication",
        "Notifications",
        "File Management",
        "Audit Logs"
    },
    endpoints = new
    {
        swagger = app.Environment.IsDevelopment() ? "/swagger" : "Not available in production",
        health = "/health",
        api = "/api"
    }
}))
.WithName("GetApiInfo")
.WithTags("Info")
.Produces(200);

// Health check endpoints are now handled by HealthController

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications"); // Map SignalR Hub

app.Run();
