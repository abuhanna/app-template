using App.Template.Api.Controllers;
using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Services;
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
    public async Task GetAll_ReturnsOkResult_WithPagedUsers()
    {
        // Arrange
        var users = new List<UserDto>
        {
            new() { Id = 1, Username = "user1", Email = "user1@example.com", IsActive = true, CreatedAt = DateTime.UtcNow },
            new() { Id = 2, Username = "user2", Email = "user2@example.com", IsActive = true, CreatedAt = DateTime.UtcNow }
        };
        var pagedResult = new PagedResult<UserDto>
        {
            Items = users,
            Pagination = new PaginationMeta { Page = 1, PageSize = 10, TotalItems = 2, TotalPages = 1 }
        };
        var queryParams = new UsersQueryParams();
        _mockUserService.Setup(s => s.GetUsersAsync(It.IsAny<UsersQueryParams>())).ReturnsAsync(pagedResult);

        // Act
        var result = await _controller.GetAll(queryParams);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnValue = Assert.IsType<PagedResult<UserDto>>(okResult.Value);
        Assert.Equal(2, returnValue.Items.Count);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenUserDoesNotExist()
    {
        // Arrange
        _mockUserService.Setup(s => s.GetUserByIdAsync(1L)).ReturnsAsync((UserDto?)null);

        // Act
        var result = await _controller.GetById(1L);

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }
}
