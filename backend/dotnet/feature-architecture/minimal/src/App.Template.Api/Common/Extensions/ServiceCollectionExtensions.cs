using App.Template.Api.Common.Services;
using App.Template.Api.Features.Auth;
using App.Template.Api.Features.Export;
using App.Template.Api.Features.Files;
using App.Template.Api.Features.Notifications;

namespace App.Template.Api.Common.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddFeatureServices(this IServiceCollection services)
    {
        // JWT Token Validation
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

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
