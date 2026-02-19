using App.Template.Api.Repositories;
using App.Template.Api.Services;

namespace App.Template.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<Services.IFileService, Services.FileService>();
        services.AddScoped<Services.IAuthService, Services.AuthService>();
        services.AddScoped<Services.IJwtTokenGenerator, Services.JwtTokenGenerator>();
        services.AddScoped<Repositories.IUserRepository, Repositories.UserRepository>();

        return services;
    }

    public static void AddAutoMapper(this IServiceCollection services, Type assemblyMarkerType)
    {
        services.AddAutoMapper(config =>
        {
            config.CreateMap<Models.Entities.User, Models.Dtos.UserDto>();
        }, assemblyMarkerType.Assembly);
    }
}
