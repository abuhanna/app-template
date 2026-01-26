using App.Template.Api.Repositories;
using App.Template.Api.Services;

namespace App.Template.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Register Repositories
        services.AddScoped<IUserRepository, UserRepository>();

        // Register Services
        services.AddScoped<IUserService, UserService>();

        return services;
    }
}
