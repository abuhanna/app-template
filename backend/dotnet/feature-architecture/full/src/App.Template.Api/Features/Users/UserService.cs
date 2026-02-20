using App.Template.Api.Common.Models;
using App.Template.Api.Common.Services;
using App.Template.Api.Features.Users.Dtos;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Features.Users;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHashService _passwordHashService;
    private readonly ILogger<UserService> _logger;

    public UserService(IUserRepository userRepository, IPasswordHashService passwordHashService, ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _passwordHashService = passwordHashService;
        _logger = logger;
    }

    public async Task<PagedResult<UserDto>> GetUsersAsync(UsersQueryParams queryParams)
    {
        var query = _userRepository.GetQueryable()
            .Include(u => u.Department)
            .AsQueryable();

        if (!string.IsNullOrEmpty(queryParams.Search))
        {
            var search = queryParams.Search.ToLower();
            query = query.Where(u =>
                u.Username.ToLower().Contains(search) ||
                u.Email.ToLower().Contains(search) ||
                (u.Name != null && u.Name.ToLower().Contains(search)));
        }

        if (queryParams.IsActive.HasValue)
            query = query.Where(u => u.IsActive == queryParams.IsActive.Value);

        if (queryParams.DepartmentId.HasValue)
            query = query.Where(u => u.DepartmentId == queryParams.DepartmentId.Value);

        query = (queryParams.SortBy?.ToLower(), queryParams.SortDir?.ToLower()) switch
        {
            ("username", "desc") => query.OrderByDescending(u => u.Username),
            ("username", _) => query.OrderBy(u => u.Username),
            ("email", "desc") => query.OrderByDescending(u => u.Email),
            ("email", _) => query.OrderBy(u => u.Email),
            ("name", "desc") => query.OrderByDescending(u => u.Name),
            ("name", _) => query.OrderBy(u => u.Name),
            ("createdat", "desc") => query.OrderByDescending(u => u.CreatedAt),
            ("createdat", _) => query.OrderBy(u => u.CreatedAt),
            _ => query.OrderBy(u => u.Username)
        };

        var page = queryParams.Page < 1 ? 1 : queryParams.Page;
        var pageSize = queryParams.PageSize < 1 ? 10 : queryParams.PageSize;

        var dtoQuery = query.Select(u => new UserDto
        {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email,
            Name = u.Name,
            Role = u.Role,
            DepartmentId = u.DepartmentId,
            DepartmentName = u.Department != null ? u.Department.Name : null,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt,
            LastLoginAt = u.LastLoginAt
        });

        return await PagedResult<UserDto>.CreateAsync(dtoQuery, page, pageSize);
    }

    public async Task<UserDto?> GetUserByIdAsync(long id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        return user == null ? null : MapToDto(user);
    }

    public async Task<UserDto> CreateUserAsync(CreateUserRequest request)
    {
        var existingByUsername = await _userRepository.GetByUsernameAsync(request.Username);
        if (existingByUsername != null)
            throw new InvalidOperationException("Username is already taken");

        var existingByEmail = await _userRepository.GetByEmailAsync(request.Email);
        if (existingByEmail != null)
            throw new InvalidOperationException("Email is already in use");

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = _passwordHashService.HashPassword(request.Password),
            Name = request.Name,
            Role = request.Role ?? "User",
            DepartmentId = request.DepartmentId,
            IsActive = true
        };

        var created = await _userRepository.CreateAsync(user);
        return MapToDto(created);
    }

    public async Task<UserDto?> UpdateUserAsync(long id, UpdateUserRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return null;

        if (!string.IsNullOrEmpty(request.Email) && request.Email != user.Email)
        {
            var emailExists = await _userRepository.GetByEmailAsync(request.Email);
            if (emailExists != null)
                throw new InvalidOperationException("Email is already in use");
            user.Email = request.Email;
        }

        if (request.Name != null) user.Name = request.Name;
        if (request.Role != null) user.Role = request.Role;
        if (request.DepartmentId.HasValue) user.DepartmentId = request.DepartmentId;
        if (request.IsActive.HasValue) user.IsActive = request.IsActive.Value;

        var updated = await _userRepository.UpdateAsync(user);
        return MapToDto(updated);
    }

    public async Task<bool> DeleteUserAsync(long id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return false;
        await _userRepository.DeleteAsync(id);
        return true;
    }

    public async Task ChangePasswordAsync(long userId, ChangePasswordRequest request)
    {
        if (request.NewPassword != request.ConfirmPassword)
            throw new InvalidOperationException("Passwords do not match");

        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found");

        if (!_passwordHashService.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            throw new InvalidOperationException("Current password is incorrect");

        if (user.PasswordHistory.Any(h => _passwordHashService.VerifyPassword(request.NewPassword, h)))
            throw new InvalidOperationException("Password was recently used. Please choose a different password.");

        user.PasswordHistory.Add(user.PasswordHash);
        if (user.PasswordHistory.Count > 5)
            user.PasswordHistory.RemoveAt(0);

        user.PasswordHash = _passwordHashService.HashPassword(request.NewPassword);
        await _userRepository.UpdateAsync(user);
    }

    private static UserDto MapToDto(User user) => new()
    {
        Id = user.Id,
        Username = user.Username,
        Email = user.Email,
        Name = user.Name,
        Role = user.Role,
        DepartmentId = user.DepartmentId,
        DepartmentName = user.Department?.Name,
        IsActive = user.IsActive,
        CreatedAt = user.CreatedAt,
        LastLoginAt = user.LastLoginAt
    };
}
