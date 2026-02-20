using App.Template.Api.Features.AuditLogs;
using App.Template.Api.Features.Departments;
using App.Template.Api.Features.Files;
using App.Template.Api.Features.Notifications;
using App.Template.Api.Features.Users;

namespace App.Template.Api.Common.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddFeatureServices(this IServiceCollection services)
    {
        // Common Services
        services.AddScoped<App.Template.Api.Common.Services.IJwtTokenGenerator, App.Template.Api.Common.Services.JwtTokenGenerator>();
        services.AddScoped<App.Template.Api.Common.Services.IPasswordHashService, App.Template.Api.Common.Services.PasswordHashService>();
        services.AddScoped<App.Template.Api.Common.Services.IEmailService, App.Template.Api.Common.Services.EmailService>();
        services.AddScoped<App.Template.Api.Common.Services.DbSeeder>();

        // Users Feature
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IUserService, UserService>();

        // Auth Feature
        services.AddScoped<App.Template.Api.Features.Auth.IAuthService, App.Template.Api.Features.Auth.AuthService>();

        // Departments Feature
        services.AddScoped<IDepartmentService, DepartmentService>();

        // Files Feature
        services.AddScoped<IFileService, FileService>();

        // Notifications Feature
        services.AddScoped<INotificationService, NotificationService>();

        // AuditLogs Feature
        services.AddScoped<IAuditLogService, AuditLogService>();

        // Export Feature
        services.AddScoped<App.Template.Api.Common.Services.IExportService, App.Template.Api.Common.Services.ExportService>();

        return services;
    }
}
