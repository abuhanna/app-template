using AppTemplate.Application.DTOs;
using AppTemplate.Application.Interfaces;
using AppTemplate.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Application.Features.Authentication.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, UserDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHashService _passwordHashService;
    private readonly ILogger<RegisterCommandHandler> _logger;

    public RegisterCommandHandler(
        IApplicationDbContext context,
        IPasswordHashService passwordHashService,
        ILogger<RegisterCommandHandler> logger)
    {
        _context = context;
        _passwordHashService = passwordHashService;
        _logger = logger;
    }

    public async Task<UserDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Registering user: {Username}", request.Username);

        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username, cancellationToken);
        if (existingUser != null)
            throw new InvalidOperationException("Username is already taken");

        var existingByEmail = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
        if (existingByEmail != null)
            throw new InvalidOperationException("Email is already in use");

        var passwordHash = _passwordHashService.HashPassword(request.Password);

        var user = new User(
            request.Username,
            request.Email,
            passwordHash,
            request.FirstName,
            request.LastName,
            "user",
            null);

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User registered successfully: {Username} (ID: {Id})", user.Username, user.Id);

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = $"{user.FirstName} {user.LastName}".Trim(),
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }
}
