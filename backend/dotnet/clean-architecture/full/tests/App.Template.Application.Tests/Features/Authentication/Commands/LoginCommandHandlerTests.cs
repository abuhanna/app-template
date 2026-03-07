using System.Linq.Expressions;
using AppTemplate.Application.Features.Authentication.Commands.Login;
using AppTemplate.Application.Interfaces;
using AppTemplate.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;

namespace AppTemplate.Application.Tests.Features.Authentication.Commands;

public class LoginCommandHandlerTests
{
    private readonly Mock<IApplicationDbContext> _mockContext;
    private readonly Mock<IPasswordHashService> _mockPasswordHashService;
    private readonly Mock<IJwtTokenService> _mockJwtTokenService;
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly Mock<ILogger<LoginCommandHandler>> _mockLogger;
    private readonly LoginCommandHandler _handler;

    public LoginCommandHandlerTests()
    {
        _mockContext = new Mock<IApplicationDbContext>();
        _mockPasswordHashService = new Mock<IPasswordHashService>();
        _mockJwtTokenService = new Mock<IJwtTokenService>();
        _mockConfiguration = new Mock<IConfiguration>();
        _mockLogger = new Mock<ILogger<LoginCommandHandler>>();

        _mockConfiguration
            .Setup(c => c.GetSection("Jwt:ExpirationMinutes").Value)
            .Returns("60");

        _handler = new LoginCommandHandler(
            _mockContext.Object,
            _mockPasswordHashService.Object,
            _mockJwtTokenService.Object,
            _mockConfiguration.Object,
            _mockLogger.Object);
    }

    [Fact]
    public async Task Handle_ReturnsLoginResponse_WhenCredentialsAreValid()
    {
        // Arrange
        var user = new User(
            username: "admin",
            email: "admin@example.com",
            passwordHash: "hashed_password",
            name: "Admin User",
            role: "Admin");

        var users = new List<User> { user };
        var mockUsersDbSet = CreateMockDbSetAsync(users);
        _mockContext.Setup(x => x.Users).Returns(mockUsersDbSet.Object);

        var refreshTokens = new List<RefreshToken>();
        var mockRefreshTokensDbSet = CreateMockDbSetAsync(refreshTokens);
        _mockContext.Setup(x => x.RefreshTokens).Returns(mockRefreshTokensDbSet.Object);

        _mockPasswordHashService
            .Setup(x => x.VerifyPassword("Admin@123", "hashed_password"))
            .Returns(true);

        _mockJwtTokenService
            .Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns("jwt-token");

        _mockJwtTokenService
            .Setup(x => x.GenerateRefreshToken())
            .Returns("refresh-token");

        _mockJwtTokenService
            .Setup(x => x.GetRefreshTokenExpirationDays())
            .Returns(7);

        _mockContext
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var command = new LoginCommand { Username = "admin", Password = "Admin@123" };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("jwt-token", result.Token);
        Assert.Equal("Bearer", result.TokenType);
        Assert.Equal("refresh-token", result.RefreshToken);
        Assert.NotNull(result.User);
        Assert.Equal("admin", result.User!.Username);
    }

    [Fact]
    public async Task Handle_ThrowsInvalidOperationException_WhenUserNotFound()
    {
        // Arrange
        var users = new List<User>();
        var mockUsersDbSet = CreateMockDbSetAsync(users);
        _mockContext.Setup(x => x.Users).Returns(mockUsersDbSet.Object);

        var command = new LoginCommand { Username = "nonexistent", Password = "password" };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _handler.Handle(command, CancellationToken.None));

        Assert.Contains("Invalid username or password", exception.Message);
    }

    [Fact]
    public async Task Handle_ThrowsInvalidOperationException_WhenPasswordIsWrong()
    {
        // Arrange
        var user = new User(
            username: "admin",
            email: "admin@example.com",
            passwordHash: "hashed_password",
            name: "Admin User",
            role: "Admin");

        var users = new List<User> { user };
        var mockUsersDbSet = CreateMockDbSetAsync(users);
        _mockContext.Setup(x => x.Users).Returns(mockUsersDbSet.Object);

        _mockPasswordHashService
            .Setup(x => x.VerifyPassword("wrongpassword", "hashed_password"))
            .Returns(false);

        var command = new LoginCommand { Username = "admin", Password = "wrongpassword" };

        // Act & Assert
        // When password verification fails, TryLocalAuthAsync returns null,
        // and Handle throws InvalidOperationException("Invalid username or password")
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _handler.Handle(command, CancellationToken.None));

        Assert.Contains("Invalid username or password", exception.Message);
    }

    [Fact]
    public async Task Handle_ThrowsInvalidOperationException_WhenUserIsInactive()
    {
        // Arrange
        var user = new User(
            username: "inactiveuser",
            email: "inactive@example.com",
            passwordHash: "hashed_password",
            name: "Inactive User",
            role: "User");
        user.SetActive(false);

        var users = new List<User> { user };
        var mockUsersDbSet = CreateMockDbSetAsync(users);
        _mockContext.Setup(x => x.Users).Returns(mockUsersDbSet.Object);

        var command = new LoginCommand { Username = "inactiveuser", Password = "password" };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _handler.Handle(command, CancellationToken.None));

        Assert.Contains("deactivated", exception.Message);
    }

    private static Mock<DbSet<T>> CreateMockDbSetAsync<T>(List<T> data) where T : class
    {
        var queryable = data.AsQueryable();
        var mockSet = new Mock<DbSet<T>>();

        mockSet.As<IAsyncEnumerable<T>>()
            .Setup(m => m.GetAsyncEnumerator(It.IsAny<CancellationToken>()))
            .Returns(new TestAsyncEnumerator<T>(data.GetEnumerator()));

        mockSet.As<IQueryable<T>>()
            .Setup(m => m.Provider)
            .Returns(new TestAsyncQueryProvider<T>(queryable.Provider));

        mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(queryable.Expression);
        mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
        mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(() => queryable.GetEnumerator());

        mockSet.Setup(d => d.Add(It.IsAny<T>())).Callback<T>(data.Add);

        return mockSet;
    }
}

// Reuse the same async query helpers from CreateUserCommandHandlerTests
// These are already defined in that file's namespace and compilation unit
// but since C# requires them to be accessible, we define internal aliases
// that reference the same pattern. The existing TestAsyncQueryProvider,
// TestAsyncEnumerable, and TestAsyncEnumerator classes from
// CreateUserCommandHandlerTests.cs are in the same project/namespace
// and are already internal, so they are accessible here.
