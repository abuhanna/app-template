using App.Template.Api.Common.Models;
using App.Template.Api.Features.Users;
using App.Template.Api.Features.Users.Dtos;
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
    public async Task GetAll_ReturnsOkResult_WithPaginatedUsers()
    {
        var queryParams = new UsersQueryParams();
        var users = new PagedResult<UserDto>
        {
            Items = new List<UserDto>
            {
                new() { Id = 1, Username = "user1", Email = "user1@example.com", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Id = 2, Username = "user2", Email = "user2@example.com", IsActive = true, CreatedAt = DateTime.UtcNow }
            }
        };
        _mockUserService.Setup(s => s.GetUsersAsync(queryParams)).ReturnsAsync(users);

        var result = await _controller.GetAll(queryParams);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<PaginatedResponse<UserDto>>(okResult.Value);
        Assert.True(value.Success);
    }

    [Fact]
    public async Task GetById_ReturnsOk_WhenUserExists()
    {
        var user = new UserDto { Id = 1, Username = "user1", Email = "user1@example.com" };
        _mockUserService.Setup(s => s.GetUserByIdAsync(1)).ReturnsAsync(user);

        var result = await _controller.GetById(1);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<ApiResponse<UserDto>>(okResult.Value);
        Assert.True(value.Success);
        Assert.Equal("user1", value.Data!.Username);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenUserDoesNotExist()
    {
        _mockUserService.Setup(s => s.GetUserByIdAsync(1)).ReturnsAsync((UserDto?)null);

        var result = await _controller.GetById(1);

        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
        var value = Assert.IsType<ApiResponse>(notFoundResult.Value);
        Assert.False(value.Success);
    }

    [Fact]
    public async Task Create_ReturnsCreated_WithUser()
    {
        var request = new CreateUserRequest { Username = "newuser", Email = "new@test.com", Password = "Pass@123" };
        var user = new UserDto { Id = 3, Username = "newuser", Email = "new@test.com" };
        _mockUserService.Setup(s => s.CreateUserAsync(request)).ReturnsAsync(user);

        var result = await _controller.Create(request);

        var objectResult = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(201, objectResult.StatusCode);
        var value = Assert.IsType<ApiResponse<UserDto>>(objectResult.Value);
        Assert.True(value.Success);
        Assert.Equal(3, value.Data!.Id);
    }

    [Fact]
    public async Task Update_ReturnsOk_WhenUserExists()
    {
        var request = new UpdateUserRequest { FirstName = "Updated" };
        var user = new UserDto { Id = 1, Username = "user1", FirstName = "Updated" };
        _mockUserService.Setup(s => s.UpdateUserAsync(1, request)).ReturnsAsync(user);

        var result = await _controller.Update(1, request);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<ApiResponse<UserDto>>(okResult.Value);
        Assert.True(value.Success);
    }

    [Fact]
    public async Task Update_ReturnsNotFound_WhenUserDoesNotExist()
    {
        var request = new UpdateUserRequest { FirstName = "Updated" };
        _mockUserService.Setup(s => s.UpdateUserAsync(1, request)).ReturnsAsync((UserDto?)null);

        var result = await _controller.Update(1, request);

        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
        var value = Assert.IsType<ApiResponse>(notFoundResult.Value);
        Assert.False(value.Success);
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

        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var value = Assert.IsType<ApiResponse>(notFoundResult.Value);
        Assert.False(value.Success);
    }
}
