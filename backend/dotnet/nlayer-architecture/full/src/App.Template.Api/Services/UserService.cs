using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Models.Entities;
using App.Template.Api.Repositories;

namespace App.Template.Api.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHashService _passwordHashService;
    private readonly IDepartmentRepository _departmentRepository;

    public UserService(IUserRepository userRepository, IPasswordHashService passwordHashService, IDepartmentRepository departmentRepository)
    {
        _userRepository = userRepository;
        _passwordHashService = passwordHashService;
        _departmentRepository = departmentRepository;
    }

    public async Task<PagedResult<UserDto>> GetUsersAsync(UsersQueryParams queryParams)
    {
        var query = _userRepository.GetQueryable();

        if (!string.IsNullOrEmpty(queryParams.Search))
        {
            var search = queryParams.Search.ToLower();
            query = query.Where(u =>
                u.Username.ToLower().Contains(search) ||
                u.Email.ToLower().Contains(search) ||
                (u.FirstName != null && u.FirstName.ToLower().Contains(search)) ||
                (u.LastName != null && u.LastName.ToLower().Contains(search)));
        }

        if (queryParams.IsActive.HasValue)
            query = query.Where(u => u.IsActive == queryParams.IsActive.Value);

        if (queryParams.DepartmentId.HasValue)
            query = query.Where(u => u.DepartmentId == queryParams.DepartmentId.Value);

        query = (queryParams.SortBy?.ToLower(), queryParams.SortOrder?.ToLower()) switch
        {
            ("username", "desc") => query.OrderByDescending(u => u.Username),
            ("username", _) => query.OrderBy(u => u.Username),
            ("email", "desc") => query.OrderByDescending(u => u.Email),
            ("email", _) => query.OrderBy(u => u.Email),
            ("name", "desc") => query.OrderByDescending(u => u.FirstName),
            ("name", _) => query.OrderBy(u => u.FirstName),
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
            FirstName = u.FirstName,
            LastName = u.LastName,
            FullName = $"{u.FirstName} {u.LastName}".Trim(),
            Role = u.Role,
            DepartmentId = u.DepartmentId,
            DepartmentName = u.Department != null ? u.Department.Name : null,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt,
            UpdatedAt = u.UpdatedAt,
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

        if (request.DepartmentId.HasValue)
        {
            var department = await _departmentRepository.GetByIdAsync(request.DepartmentId.Value);
            if (department == null || !department.IsActive)
                throw new InvalidOperationException($"Department with ID {request.DepartmentId} not found or is inactive");
        }

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = _passwordHashService.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = request.Role ?? "user",
            DepartmentId = request.DepartmentId,
            IsActive = request.IsActive
        };

        var created = await _userRepository.AddAsync(user);
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

        if (request.FirstName != null) user.FirstName = request.FirstName;
        if (request.LastName != null) user.LastName = request.LastName;
        if (request.Role != null) user.Role = request.Role;

        if (request.DepartmentId.HasValue)
        {
            if (request.DepartmentId != user.DepartmentId)
            {
                var department = await _departmentRepository.GetByIdAsync(request.DepartmentId.Value);
                if (department == null || !department.IsActive)
                    throw new InvalidOperationException($"Department with ID {request.DepartmentId} not found or is inactive");
            }
            user.DepartmentId = request.DepartmentId;
        }

        if (request.IsActive.HasValue) user.IsActive = request.IsActive.Value;

        var updated = await _userRepository.UpdateAsync(user);
        return MapToDto(updated);
    }

    public async Task<bool> DeleteUserAsync(long id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return false;
        user.IsActive = false;
        await _userRepository.UpdateAsync(user);
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

    private static UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = $"{user.FirstName} {user.LastName}".Trim(),
            Role = user.Role,
            DepartmentId = user.DepartmentId,
            DepartmentName = user.Department?.Name,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }
}
