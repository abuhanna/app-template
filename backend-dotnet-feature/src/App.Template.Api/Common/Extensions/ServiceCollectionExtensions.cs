using App.Template.Api.Features.Users;

namespace App.Template.Api.Common.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddFeatureServices(this IServiceCollection services)
    {
        // Users Feature
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IUserService, UserService>();

        // Add more features here as they are created
        // services.AddScoped<IProductRepository, ProductRepository>();
        // services.AddScoped<IProductService, ProductService>();

        return services;
    }
}
