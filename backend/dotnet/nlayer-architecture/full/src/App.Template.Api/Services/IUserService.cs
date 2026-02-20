using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;

namespace App.Template.Api.Services;

public interface IUserService
{
    Task<PagedResult<UserDto>> GetUsersAsync(UsersQueryParams queryParams);
    Task<UserDto?> GetUserByIdAsync(long id);
    Task<UserDto> CreateUserAsync(CreateUserRequest request);
    Task<UserDto?> UpdateUserAsync(long id, UpdateUserRequest request);
    Task<bool> DeleteUserAsync(long id);
    Task ChangePasswordAsync(long userId, ChangePasswordRequest request);
}
