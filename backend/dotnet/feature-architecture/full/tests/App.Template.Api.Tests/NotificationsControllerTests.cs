using System.Security.Claims;
using App.Template.Api.Common.Models;
using App.Template.Api.Features.Notifications;
using App.Template.Api.Features.Notifications.Dtos;
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

        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, "1") };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        _controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(identity);
    }

    [Fact]
    public async Task GetAll_ReturnsOk_WithPaginatedNotifications()
    {
        var queryParams = new NotificationsQueryParams();
        var notifications = new PagedResult<NotificationDto>
        {
            Items = new List<NotificationDto>
            {
                new() { Id = 1, Title = "Test Notification", IsRead = false }
            }
        };
        _mockNotificationService.Setup(s => s.GetNotificationsAsync("1", queryParams)).ReturnsAsync(notifications);

        var result = await _controller.GetAll(queryParams);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<PaginatedResponse<NotificationDto>>(okResult.Value);
        Assert.True(value.Success);
    }

    [Fact]
    public async Task GetUnreadCount_ReturnsOk_WithCount()
    {
        _mockNotificationService.Setup(s => s.GetUnreadCountAsync("1")).ReturnsAsync(5);

        var result = await _controller.GetUnreadCount();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task MarkAsRead_ReturnsNoContent_WhenSuccessful()
    {
        _mockNotificationService.Setup(s => s.MarkAsReadAsync(1, "1")).ReturnsAsync(true);

        var result = await _controller.MarkAsRead(1);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task MarkAsRead_ReturnsNotFound_WhenNotificationDoesNotExist()
    {
        _mockNotificationService.Setup(s => s.MarkAsReadAsync(1, "1")).ReturnsAsync(false);

        var result = await _controller.MarkAsRead(1);

        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var value = Assert.IsType<ApiResponse>(notFoundResult.Value);
        Assert.False(value.Success);
    }

    [Fact]
    public async Task MarkAllAsRead_ReturnsNoContent()
    {
        _mockNotificationService.Setup(s => s.MarkAllAsReadAsync("1")).Returns(Task.CompletedTask);

        var result = await _controller.MarkAllAsRead();

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenSuccessful()
    {
        _mockNotificationService.Setup(s => s.DeleteAsync(1, "1")).ReturnsAsync(true);

        var result = await _controller.Delete(1);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNotFound_WhenNotificationDoesNotExist()
    {
        _mockNotificationService.Setup(s => s.DeleteAsync(1, "1")).ReturnsAsync(false);

        var result = await _controller.Delete(1);

        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var value = Assert.IsType<ApiResponse>(notFoundResult.Value);
        Assert.False(value.Success);
    }
}
