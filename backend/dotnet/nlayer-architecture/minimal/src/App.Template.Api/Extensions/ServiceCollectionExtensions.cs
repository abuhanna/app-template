using App.Template.Api.Repositories;
using App.Template.Api.Services;

namespace App.Template.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Repositories
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IAuditLogRepository, AuditLogRepository>();
        services.AddScoped<IUploadedFileRepository, UploadedFileRepository>();

        // JWT Token Validation
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

        // Auth (SSO-only)
        services.AddScoped<ISsoAuthService, SsoAuthService>();

        // Application services
        services.AddScoped<IFileService, FileService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IExportService, ExportService>();

        return services;
    }
}
