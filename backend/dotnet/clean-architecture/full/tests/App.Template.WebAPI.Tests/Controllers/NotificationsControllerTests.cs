using AppTemplate.Application.Common.Models;
using AppTemplate.Application.DTOs;
using AppTemplate.Application.Features.NotificationManagement.Commands.MarkAllAsRead;
using AppTemplate.Application.Features.NotificationManagement.Commands.MarkAsRead;
using AppTemplate.Application.Features.NotificationManagement.Queries.GetNotifications;
using AppTemplate.Domain.Enums;
using AppTemplate.WebAPI.Controllers;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace AppTemplate.WebAPI.Tests.Controllers;

public class NotificationsControllerTests
{
    private readonly Mock<IMediator> _mockMediator;
    private readonly NotificationsController _controller;

    public NotificationsControllerTests()
    {
        _mockMediator = new Mock<IMediator>();
        _controller = new NotificationsController(_mockMediator.Object);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
    }

    #region GetMyNotifications

    [Fact]
    public async Task GetMyNotifications_ReturnsOk_WithPagedResult()
    {
        // Arrange
        var pagedResult = PagedResult<NotificationDto>.Create(
            new List<NotificationDto>
            {
                new()
                {
                    Id = 1,
                    Title = "Welcome",
                    Message = "Welcome to the system",
                    Type = NotificationType.Info,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = 2,
                    Title = "Update",
                    Message = "Profile updated",
                    Type = NotificationType.Success,
                    IsRead = true,
                    CreatedAt = DateTime.UtcNow
                }
            },
            page: 1, pageSize: 20, totalItems: 2);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetNotificationsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(pagedResult);

        // Act
        var result = await _controller.GetMyNotifications(null, null, null, null);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<PagedResult<NotificationDto>>(okResult.Value);
        Assert.Equal(2, response.Items.Count);
    }

    #endregion

    #region MarkAsRead

    [Fact]
    public async Task MarkAsRead_ReturnsNoContent_WhenSuccessful()
    {
        // Arrange
        _mockMediator
            .Setup(m => m.Send(It.IsAny<MarkNotificationReadCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.MarkAsRead(1);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task MarkAsRead_ReturnsNoContent_EvenWhenNotificationNotFound()
    {
        // Arrange - The controller does not check the return value of MarkNotificationReadCommand
        // It always returns NoContent regardless
        _mockMediator
            .Setup(m => m.Send(It.IsAny<MarkNotificationReadCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.MarkAsRead(999);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    #endregion

    #region MarkAllAsRead

    [Fact]
    public async Task MarkAllAsRead_ReturnsNoContent_WhenSuccessful()
    {
        // Arrange
        _mockMediator
            .Setup(m => m.Send(It.IsAny<MarkAllNotificationsReadCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.MarkAllAsRead();

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    #endregion
}
