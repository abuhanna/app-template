using App.Template.Api.Controllers;
using App.Template.Api.Models.Common;
using App.Template.Api.Models.Entities;
using App.Template.Api.Repositories;
using App.Template.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace App.Template.Api.Tests;

public class NotificationsControllerTests
{
    private readonly Mock<INotificationRepository> _mockRepo;
    private readonly Mock<ICurrentUserService> _mockCurrentUser;
    private readonly NotificationsController _controller;

    public NotificationsControllerTests()
    {
        _mockRepo = new Mock<INotificationRepository>();
        _mockCurrentUser = new Mock<ICurrentUserService>();
        _mockCurrentUser.Setup(s => s.UserId).Returns("1");
        _controller = new NotificationsController(_mockRepo.Object, _mockCurrentUser.Object);
    }

    [Fact]
    public async Task GetMyNotifications_ReturnsOk()
    {
        var result = new PagedResult<Notification>
        {
            Items = new List<Notification>(),
            Pagination = new PaginationMeta { Page = 1, PageSize = 10, TotalItems = 0, TotalPages = 0 }
        };
        _mockRepo
            .Setup(r => r.GetByUserIdPagedAsync("1", 1, 10, null, null, null, "desc", It.IsAny<CancellationToken>()))
            .ReturnsAsync(result);

        var actionResult = await _controller.GetMyNotifications();

        Assert.IsType<OkObjectResult>(actionResult);
    }

    [Fact]
    public async Task GetUnreadCount_ReturnsOk()
    {
        _mockRepo.Setup(r => r.GetUnreadCountAsync("1", It.IsAny<CancellationToken>())).ReturnsAsync(3);

        var result = await _controller.GetUnreadCount(CancellationToken.None);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task MarkAsRead_ReturnsNoContent_WhenSuccessful()
    {
        _mockRepo.Setup(r => r.MarkAsReadAsync(1, "1", It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var result = await _controller.MarkAsRead(1, CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task MarkAsRead_ReturnsNotFound_WhenNotExists()
    {
        _mockRepo.Setup(r => r.MarkAsReadAsync(1, "1", It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var result = await _controller.MarkAsRead(1, CancellationToken.None);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task MarkAllAsRead_ReturnsNoContent()
    {
        _mockRepo.Setup(r => r.MarkAllAsReadAsync("1", It.IsAny<CancellationToken>())).ReturnsAsync(5);

        var result = await _controller.MarkAllAsRead(CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenSuccessful()
    {
        _mockRepo.Setup(r => r.DeleteAsync(1, "1", It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var result = await _controller.Delete(1, CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNotFound_WhenNotExists()
    {
        _mockRepo.Setup(r => r.DeleteAsync(1, "1", It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var result = await _controller.Delete(1, CancellationToken.None);

        Assert.IsType<NotFoundObjectResult>(result);
    }
}
