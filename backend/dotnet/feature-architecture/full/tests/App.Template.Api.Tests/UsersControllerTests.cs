using App.Template.Api.Features.Users;
using App.Template.Api.Features.Users.Dtos;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace App.Template.Api.Tests;

public class UsersControllerTests
{
    private readonly Mock<IUserService> _mockUserService;
    private readonly UsersController _controller;

    public UsersControllerTests()
    {
        _mockUserService = new Mock<IUserService>();
        _controller = new UsersController(_mockUserService.Object);
    }

    [Fact]
    public async Task GetAll_ReturnsOkResult_WithListOfUsers()
    {
        // Arrange
        var queryParams = new UsersQueryParams();
        var users = new App.Template.Api.Common.Models.PagedResult<UserDto>
        {
            Items = new List<UserDto>
            {
                new() { Id = 1, Username = "user1", Email = "user1@example.com", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Id = 2, Username = "user2", Email = "user2@example.com", IsActive = true, CreatedAt = DateTime.UtcNow }
            }
        };
        _mockUserService.Setup(s => s.GetUsersAsync(queryParams)).ReturnsAsync(users);

        // Act
        var result = await _controller.GetAll(queryParams);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenUserDoesNotExist()
    {
        // Arrange
        _mockUserService.Setup(s => s.GetUserByIdAsync(1)).ReturnsAsync((UserDto?)null);

        // Act
        var result = await _controller.GetById(1);

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }
}
