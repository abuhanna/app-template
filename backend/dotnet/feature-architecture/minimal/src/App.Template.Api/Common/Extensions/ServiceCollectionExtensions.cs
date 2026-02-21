using App.Template.Api.Features.Auth;
using App.Template.Api.Features.Export;
using App.Template.Api.Features.Files;
using App.Template.Api.Features.Notifications;
using App.Template.Api.Features.Users;

namespace App.Template.Api.Common.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddFeatureServices(this IServiceCollection services)
    {
        // Users Feature
        services.AddScoped<IUserRepository, UserRepository>();

        // Auth Feature (SSO-only)
        services.AddScoped<ISsoAuthService, SsoAuthService>();

        // Files Feature
        services.AddScoped<IFileService, FileService>();

        // Notifications Feature
        services.AddScoped<INotificationService, NotificationService>();

        // Export Feature
        services.AddScoped<IExportService, ExportService>();

        return services;
    }
}
