using System.Linq.Expressions;
using AppTemplate.Application.Features.UserManagement.Commands.CreateUser;
using AppTemplate.Application.Interfaces;
using AppTemplate.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.Extensions.Logging;
using Moq;

namespace AppTemplate.Application.Tests.Features.UserManagement.Commands;

public class CreateUserCommandHandlerTests
{
    private readonly Mock<IApplicationDbContext> _mockContext;
    private readonly Mock<IPasswordHashService> _mockPasswordHashService;
    private readonly Mock<ILogger<CreateUserCommandHandler>> _mockLogger;
    private readonly CreateUserCommandHandler _handler;

    public CreateUserCommandHandlerTests()
    {
        _mockContext = new Mock<IApplicationDbContext>();
        _mockPasswordHashService = new Mock<IPasswordHashService>();
        _mockLogger = new Mock<ILogger<CreateUserCommandHandler>>();
        _handler = new CreateUserCommandHandler(
            _mockContext.Object,
            _mockPasswordHashService.Object,
            _mockLogger.Object);
    }

    [Fact]
    public async Task Handle_ShouldCreateUser_WhenValidCommand()
    {
        // Arrange
        var command = new CreateUserCommand
        {
            Username = "newuser",
            Email = "newuser@example.com",
            Password = "Password123",
            Name = "New User",
            Role = "User"
        };

        var users = new List<User>();
        var mockUsersDbSet = CreateMockDbSetAsync(users);
        _mockContext.Setup(x => x.Users).Returns(mockUsersDbSet.Object);

        var departments = new List<Department>();
        var mockDepartmentsDbSet = CreateMockDbSetAsync(departments);
        _mockContext.Setup(x => x.Departments).Returns(mockDepartmentsDbSet.Object);

        _mockPasswordHashService
            .Setup(x => x.HashPassword(It.IsAny<string>()))
            .Returns("hashed_password");

        _mockContext
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(command.Username, result.Username);
        Assert.Equal(command.Email, result.Email);
        Assert.Equal(command.Name, result.Name);
        Assert.Equal(command.Role, result.Role);

        _mockPasswordHashService.Verify(x => x.HashPassword(command.Password), Times.Once);
        _mockContext.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldThrowException_WhenUsernameExists()
    {
        // Arrange
        var existingUser = new User(
            username: "existinguser",
            email: "existing@example.com",
            passwordHash: "hash",
            name: "Existing User",
            role: "User");

        var command = new CreateUserCommand
        {
            Username = "existinguser",
            Email = "newuser@example.com",
            Password = "Password123"
        };

        var users = new List<User> { existingUser };
        var mockUsersDbSet = CreateMockDbSetAsync(users);
        _mockContext.Setup(x => x.Users).Returns(mockUsersDbSet.Object);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _handler.Handle(command, CancellationToken.None));

        Assert.Contains("already taken", exception.Message);
    }

    [Fact]
    public async Task Handle_ShouldThrowException_WhenEmailExists()
    {
        // Arrange
        var existingUser = new User(
            username: "differentuser",
            email: "existing@example.com",
            passwordHash: "hash",
            name: "Different User",
            role: "User");

        var command = new CreateUserCommand
        {
            Username = "newuser",
            Email = "existing@example.com",
            Password = "Password123"
        };

        var users = new List<User> { existingUser };
        var mockUsersDbSet = CreateMockDbSetAsync(users);
        _mockContext.Setup(x => x.Users).Returns(mockUsersDbSet.Object);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _handler.Handle(command, CancellationToken.None));

        Assert.Contains("already registered", exception.Message);
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

internal class TestAsyncQueryProvider<TEntity> : IAsyncQueryProvider
{
    private readonly IQueryProvider _inner;

    internal TestAsyncQueryProvider(IQueryProvider inner)
    {
        _inner = inner;
    }

    public IQueryable CreateQuery(Expression expression)
    {
        return new TestAsyncEnumerable<TEntity>(expression);
    }

    public IQueryable<TElement> CreateQuery<TElement>(Expression expression)
    {
        return new TestAsyncEnumerable<TElement>(expression);
    }

    public object? Execute(Expression expression)
    {
        return _inner.Execute(expression);
    }

    public TResult Execute<TResult>(Expression expression)
    {
        return _inner.Execute<TResult>(expression);
    }

    public TResult ExecuteAsync<TResult>(Expression expression, CancellationToken cancellationToken = default)
    {
        var resultType = typeof(TResult).GetGenericArguments()[0];
        var executionResult = typeof(IQueryProvider)
            .GetMethod(
                name: nameof(IQueryProvider.Execute),
                genericParameterCount: 1,
                types: new[] { typeof(Expression) })!
            .MakeGenericMethod(resultType)
            .Invoke(this, new[] { expression });

        return (TResult)typeof(Task).GetMethod(nameof(Task.FromResult))!
            .MakeGenericMethod(resultType)
            .Invoke(null, new[] { executionResult })!;
    }
}

internal class TestAsyncEnumerable<T> : EnumerableQuery<T>, IAsyncEnumerable<T>, IQueryable<T>
{
    public TestAsyncEnumerable(IEnumerable<T> enumerable)
        : base(enumerable)
    { }

    public TestAsyncEnumerable(Expression expression)
        : base(expression)
    { }

    public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default)
    {
        return new TestAsyncEnumerator<T>(this.AsEnumerable().GetEnumerator());
    }

    IQueryProvider IQueryable.Provider => new TestAsyncQueryProvider<T>(this);
}

internal class TestAsyncEnumerator<T> : IAsyncEnumerator<T>
{
    private readonly IEnumerator<T> _inner;

    public TestAsyncEnumerator(IEnumerator<T> inner)
    {
        _inner = inner;
    }

    public ValueTask DisposeAsync()
    {
        _inner.Dispose();
        return ValueTask.CompletedTask;
    }

    public ValueTask<bool> MoveNextAsync()
    {
        return ValueTask.FromResult(_inner.MoveNext());
    }

    public T Current => _inner.Current;
}
