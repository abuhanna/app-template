using App.Template.Api.Features.Users;

namespace App.Template.Api.Common.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddFeatureServices(this IServiceCollection services)
    {
        // Users Feature
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IUserService, UserService>();

        // Auth Feature
        services.AddScoped<App.Template.Api.Features.Auth.IAuthService, App.Template.Api.Features.Auth.AuthService>();
        services.AddScoped<App.Template.Api.Common.Services.IJwtTokenGenerator, App.Template.Api.Common.Services.JwtTokenGenerator>();

        // Departments Feature
        services.AddScoped<App.Template.Api.Features.Departments.IDepartmentService, App.Template.Api.Features.Departments.DepartmentService>();

        // Files Feature
        services.AddScoped<App.Template.Api.Features.Files.IFileService, App.Template.Api.Features.Files.FileService>();

        return services;
    }
}
