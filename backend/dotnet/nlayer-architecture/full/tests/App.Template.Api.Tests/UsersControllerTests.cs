using App.Template.Api.Controllers;
using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Services;
using Microsoft.AspNetCore.Http;
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
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
    }

    [Fact]
    public async Task GetAll_ReturnsOk_WithPagedUsers()
    {
        var queryParams = new UsersQueryParams();
        var pagedResult = new PagedResult<UserDto>
        {
            Items = new List<UserDto>
            {
                new() { Id = 1, Username = "user1", Email = "user1@example.com" },
                new() { Id = 2, Username = "user2", Email = "user2@example.com" }
            },
            Pagination = new PaginationMeta { Page = 1, PageSize = 10, TotalItems = 2, TotalPages = 1 }
        };
        _mockUserService.Setup(s => s.GetUsersAsync(It.IsAny<UsersQueryParams>())).ReturnsAsync(pagedResult);

        var result = await _controller.GetAll(queryParams);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<PaginatedResponse<UserDto>>(okResult.Value);
        Assert.Equal(2, value.Data!.Count);
    }

    [Fact]
    public async Task GetById_ReturnsOk_WhenUserExists()
    {
        var user = new UserDto { Id = 1, Username = "admin", Email = "admin@test.com" };
        _mockUserService.Setup(s => s.GetUserByIdAsync(1)).ReturnsAsync(user);

        var result = await _controller.GetById(1);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<ApiResponse<UserDto>>(okResult.Value);
        Assert.Equal("admin", value.Data!.Username);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenUserDoesNotExist()
    {
        _mockUserService.Setup(s => s.GetUserByIdAsync(1)).ReturnsAsync((UserDto?)null);

        var result = await _controller.GetById(1);

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task Create_Returns201_WithUser()
    {
        var request = new CreateUserRequest { Username = "newuser", Email = "new@test.com", Password = "Pass@123" };
        var created = new UserDto { Id = 5, Username = "newuser", Email = "new@test.com" };
        _mockUserService.Setup(s => s.CreateUserAsync(request)).ReturnsAsync(created);

        var result = await _controller.Create(request);

        var objectResult = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(201, objectResult.StatusCode);
    }

    [Fact]
    public async Task Update_ReturnsOk_WhenUserExists()
    {
        var request = new UpdateUserRequest { Email = "updated@test.com" };
        var updated = new UserDto { Id = 1, Username = "admin", Email = "updated@test.com" };
        _mockUserService.Setup(s => s.UpdateUserAsync(1, request)).ReturnsAsync(updated);

        var result = await _controller.Update(1, request);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task Update_ReturnsNotFound_WhenUserDoesNotExist()
    {
        var request = new UpdateUserRequest { Email = "updated@test.com" };
        _mockUserService.Setup(s => s.UpdateUserAsync(1, request)).ReturnsAsync((UserDto?)null);

        var result = await _controller.Update(1, request);

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenSuccessful()
    {
        _mockUserService.Setup(s => s.DeleteUserAsync(1)).ReturnsAsync(true);

        var result = await _controller.Delete(1);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNotFound_WhenUserDoesNotExist()
    {
        _mockUserService.Setup(s => s.DeleteUserAsync(1)).ReturnsAsync(false);

        var result = await _controller.Delete(1);

        Assert.IsType<NotFoundObjectResult>(result);
    }
}
