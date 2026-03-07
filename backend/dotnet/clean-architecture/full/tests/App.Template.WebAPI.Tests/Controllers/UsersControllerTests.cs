using AppTemplate.Application.Common.Models;
using AppTemplate.Application.DTOs;
using AppTemplate.Application.Features.UserManagement.Commands.ChangePassword;
using AppTemplate.Application.Features.UserManagement.Commands.CreateUser;
using AppTemplate.Application.Features.UserManagement.Commands.DeleteUser;
using AppTemplate.Application.Features.UserManagement.Commands.UpdateUser;
using AppTemplate.Application.Features.UserManagement.Queries.GetUserById;
using AppTemplate.Application.Features.UserManagement.Queries.GetUsers;
using AppTemplate.WebAPI.Controllers;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace AppTemplate.WebAPI.Tests.Controllers;

public class UsersControllerTests
{
    private readonly Mock<ISender> _mockMediator;
    private readonly UsersController _controller;

    public UsersControllerTests()
    {
        _mockMediator = new Mock<ISender>();
        _controller = new UsersController(_mockMediator.Object);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
    }

    #region GetUsers

    [Fact]
    public async Task GetUsers_ReturnsOk_WithPagedResult()
    {
        // Arrange
        var pagedResult = PagedResult<UserDto>.Create(
            new List<UserDto>
            {
                new() { Id = 1, Username = "user1", Email = "user1@example.com" },
                new() { Id = 2, Username = "user2", Email = "user2@example.com" }
            },
            page: 1, pageSize: 10, totalItems: 2);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetUsersQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(pagedResult);

        // Act
        var result = await _controller.GetUsers();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<PagedResult<UserDto>>(okResult.Value);
        Assert.Equal(2, response.Items.Count);
        Assert.Equal(2, response.Pagination.TotalItems);
    }

    #endregion

    #region GetUserById

    [Fact]
    public async Task GetUserById_ReturnsOk_WhenUserExists()
    {
        // Arrange
        var userDto = new UserDto { Id = 1, Username = "admin", Email = "admin@example.com" };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetUserByIdQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(userDto);

        // Act
        var result = await _controller.GetUserById(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<UserDto>(okResult.Value);
        Assert.Equal(1, response.Id);
        Assert.Equal("admin", response.Username);
    }

    [Fact]
    public async Task GetUserById_ReturnsNotFound_WhenUserDoesNotExist()
    {
        // Arrange
        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetUserByIdQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserDto?)null);

        // Act
        var result = await _controller.GetUserById(999);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal(404, notFoundResult.StatusCode);
    }

    #endregion

    #region CreateUser

    [Fact]
    public async Task CreateUser_ReturnsCreatedAtAction_WhenSuccessful()
    {
        // Arrange
        var request = new CreateUserRequest
        {
            Username = "newuser",
            Email = "newuser@example.com",
            Password = "Password123",
            FirstName = "New",
            LastName = "User",
            Role = "User"
        };

        var createdUser = new UserDto
        {
            Id = 5,
            Username = "newuser",
            Email = "newuser@example.com",
            FirstName = "New",
            LastName = "User",
            FullName = "New User",
            Role = "User"
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<CreateUserCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdUser);

        // Act
        var result = await _controller.CreateUser(request);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(201, createdResult.StatusCode);
        Assert.Equal(nameof(UsersController.GetUserById), createdResult.ActionName);
        var response = Assert.IsType<UserDto>(createdResult.Value);
        Assert.Equal(5, response.Id);
        Assert.Equal("newuser", response.Username);
    }

    #endregion

    #region UpdateUser

    [Fact]
    public async Task UpdateUser_ReturnsOk_WhenSuccessful()
    {
        // Arrange
        var request = new UpdateUserRequest
        {
            Email = "updated@example.com",
            FirstName = "Updated",
            LastName = "User"
        };

        var updatedUser = new UserDto
        {
            Id = 1,
            Username = "admin",
            Email = "updated@example.com",
            FirstName = "Updated",
            LastName = "User"
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<UpdateUserCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedUser);

        // Act
        var result = await _controller.UpdateUser(1, request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<UserDto>(okResult.Value);
        Assert.Equal("updated@example.com", response.Email);
    }

    #endregion

    #region DeleteUser

    [Fact]
    public async Task DeleteUser_ReturnsNoContent_WhenSuccessful()
    {
        // Arrange
        _mockMediator
            .Setup(m => m.Send(It.IsAny<DeleteUserCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteUser(1);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    #endregion

    #region ChangePassword

    [Fact]
    public async Task ChangePassword_ReturnsOk_WhenSuccessful()
    {
        // Arrange
        var request = new ChangePasswordRequest
        {
            CurrentPassword = "OldPassword123",
            NewPassword = "NewPassword123",
            ConfirmPassword = "NewPassword123"
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<ChangePasswordCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.ChangePassword(1, request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task GetUsers_CapsPageSizeAt100()
    {
        // Arrange
        _mockMediator
            .Setup(m => m.Send(It.Is<GetUsersQuery>(q => q.PageSize <= 100), It.IsAny<CancellationToken>()))
            .ReturnsAsync(PagedResult<UserDto>.Create(new List<UserDto>(), 1, 100, 0));

        // Act
        var result = await _controller.GetUsers(pageSize: 500);

        // Assert
        _mockMediator.Verify(
            m => m.Send(It.Is<GetUsersQuery>(q => q.PageSize == 100), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    #endregion
}
