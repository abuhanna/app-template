using AppTemplate.Application.DTOs;
using AppTemplate.Application.Interfaces;
using AppTemplate.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.UserManagement.Commands.CreateUser;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserDto>
{
    private readonly IBpmDbContext _context;
    private readonly IPasswordHashService _passwordHashService;
    private readonly ILogger<CreateUserCommandHandler> _logger;

    public CreateUserCommandHandler(
        IBpmDbContext context,
        IPasswordHashService passwordHashService,
        ILogger<CreateUserCommandHandler> logger)
    {
        _context = context;
        _passwordHashService = passwordHashService;
        _logger = logger;
    }

    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating user: {Username}", request.Username);

        // Check if username already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username, cancellationToken);
        if (existingUser != null)
        {
            throw new InvalidOperationException($"Username '{request.Username}' is already taken");
        }

        // Check if email already exists
        existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
        if (existingUser != null)
        {
            throw new InvalidOperationException($"Email '{request.Email}' is already registered");
        }

        // Validate department if provided
        string? departmentName = null;
        if (request.DepartmentId.HasValue)
        {
            var department = await _context.Departments
                .FirstOrDefaultAsync(d => d.Id == request.DepartmentId.Value, cancellationToken);
            if (department == null)
            {
                throw new InvalidOperationException($"Department with ID {request.DepartmentId} not found");
            }
            departmentName = department.Name;
        }

        // Hash password
        var passwordHash = _passwordHashService.HashPassword(request.Password);

        // Create user
        var user = new User(
            request.Username,
            request.Email,
            passwordHash,
            request.Name,
            request.Role,
            request.DepartmentId);

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User created successfully: {Username} (ID: {Id})", user.Username, user.Id);

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role,
            DepartmentId = user.DepartmentId,
            DepartmentName = departmentName,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }
}
