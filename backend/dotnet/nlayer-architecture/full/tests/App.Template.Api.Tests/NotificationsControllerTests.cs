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

public class NotificationsControllerTests
{
    private readonly Mock<INotificationService> _mockNotificationService;
    private readonly NotificationsController _controller;

    public NotificationsControllerTests()
    {
        _mockNotificationService = new Mock<INotificationService>();
        _controller = new NotificationsController(_mockNotificationService.Object);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
        SetUserClaims();
    }

    private void SetUserClaims(string userId = "1")
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        _controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(identity);
    }

    [Fact]
    public async Task GetAll_ReturnsOk_WithNotifications()
    {
        var queryParams = new NotificationsQueryParams();
        var notifications = new PagedResult<NotificationDto>
        {
            Items = new List<NotificationDto>
            {
                new() { Id = 1, Title = "Test", Message = "Test message" }
            }
        };
        _mockNotificationService
            .Setup(s => s.GetNotificationsAsync("1", queryParams))
            .ReturnsAsync(notifications);

        var result = await _controller.GetAll(queryParams);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task MarkAsRead_ReturnsOk_WhenSuccessful()
    {
        _mockNotificationService.Setup(s => s.MarkAsReadAsync(1, "1")).ReturnsAsync(true);

        var result = await _controller.MarkAsRead(1);

        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public async Task MarkAsRead_ReturnsNotFound_WhenNotificationDoesNotExist()
    {
        _mockNotificationService.Setup(s => s.MarkAsReadAsync(1, "1")).ReturnsAsync(false);

        var result = await _controller.MarkAsRead(1);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task MarkAllAsRead_ReturnsOk()
    {
        _mockNotificationService.Setup(s => s.MarkAllAsReadAsync("1")).Returns(Task.CompletedTask);

        var result = await _controller.MarkAllAsRead();

        Assert.IsType<OkResult>(result);
    }
}
