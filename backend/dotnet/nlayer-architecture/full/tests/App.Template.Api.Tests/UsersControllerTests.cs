using System.Security.Claims;
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

    private void SetUserClaims(string userId = "1", string role = "Admin")
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Name, "admin"),
            new Claim(ClaimTypes.Email, "admin@test.com"),
            new Claim(ClaimTypes.Role, role),
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        _controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(identity);
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
        var value = Assert.IsType<PagedResult<UserDto>>(okResult.Value);
        Assert.Equal(2, value.Items.Count);
    }

    [Fact]
    public async Task GetById_ReturnsOk_WhenUserExists()
    {
        var user = new UserDto { Id = 1, Username = "admin", Email = "admin@test.com" };
        _mockUserService.Setup(s => s.GetUserByIdAsync(1)).ReturnsAsync(user);

        var result = await _controller.GetById(1);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<UserDto>(okResult.Value);
        Assert.Equal("admin", value.Username);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenUserDoesNotExist()
    {
        _mockUserService.Setup(s => s.GetUserByIdAsync(1)).ReturnsAsync((UserDto?)null);

        var result = await _controller.GetById(1);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Create_ReturnsCreatedAtAction()
    {
        var request = new CreateUserRequest { Username = "newuser", Email = "new@test.com", Password = "Pass@123" };
        var created = new UserDto { Id = 5, Username = "newuser", Email = "new@test.com" };
        _mockUserService.Setup(s => s.CreateUserAsync(request)).ReturnsAsync(created);

        var result = await _controller.Create(request);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var value = Assert.IsType<UserDto>(createdResult.Value);
        Assert.Equal(5, value.Id);
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

        Assert.IsType<NotFoundResult>(result.Result);
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

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task ChangePassword_ReturnsOk_WhenSameUser()
    {
        SetUserClaims("1", "User");
        var request = new ChangePasswordRequest { CurrentPassword = "Old@123", NewPassword = "New@123" };
        _mockUserService.Setup(s => s.ChangePasswordAsync(1, request)).Returns(Task.CompletedTask);

        var result = await _controller.ChangePassword(1, request);

        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public async Task ChangePassword_ReturnsOk_WhenAdmin()
    {
        SetUserClaims("2", "Admin");
        var request = new ChangePasswordRequest { CurrentPassword = "Old@123", NewPassword = "New@123" };
        _mockUserService.Setup(s => s.ChangePasswordAsync(1, request)).Returns(Task.CompletedTask);

        var result = await _controller.ChangePassword(1, request);

        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public async Task ChangePassword_ReturnsForbid_WhenDifferentNonAdminUser()
    {
        SetUserClaims("2", "User");
        var request = new ChangePasswordRequest { CurrentPassword = "Old@123", NewPassword = "New@123" };

        var result = await _controller.ChangePassword(1, request);

        Assert.IsType<ForbidResult>(result);
    }
}
