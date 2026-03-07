using AppTemplate.Application.Common.Models;
using AppTemplate.Application.DTOs;
using AppTemplate.Application.Features.AuditLogManagement.Queries.GetAuditLogs;
using AppTemplate.WebAPI.Controllers;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace AppTemplate.WebAPI.Tests.Controllers;

public class AuditLogsControllerTests
{
    private readonly Mock<ISender> _mockMediator;
    private readonly AuditLogsController _controller;

    public AuditLogsControllerTests()
    {
        _mockMediator = new Mock<ISender>();
        _controller = new AuditLogsController(_mockMediator.Object);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
    }

    [Fact]
    public async Task GetAuditLogs_ReturnsOk_WithPagedResult()
    {
        // Arrange
        var pagedResult = PagedResult<AuditLogDto>.Create(
            new List<AuditLogDto>
            {
                new()
                {
                    Id = 1,
                    EntityName = "User",
                    EntityId = "1",
                    Action = "Created",
                    UserId = "admin",
                    Timestamp = DateTime.UtcNow
                },
                new()
                {
                    Id = 2,
                    EntityName = "Department",
                    EntityId = "2",
                    Action = "Updated",
                    UserId = "admin",
                    Timestamp = DateTime.UtcNow
                }
            },
            page: 1, pageSize: 20, totalItems: 2);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetAuditLogsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(pagedResult);

        // Act
        var result = await _controller.GetAuditLogs();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<PagedResult<AuditLogDto>>(okResult.Value);
        Assert.Equal(2, response.Items.Count);
    }

    [Fact]
    public async Task GetAuditLogs_PassesFiltersToQuery()
    {
        // Arrange
        var emptyResult = PagedResult<AuditLogDto>.Create(
            new List<AuditLogDto>(), page: 1, pageSize: 20, totalItems: 0);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetAuditLogsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(emptyResult);

        var fromDate = new DateTime(2024, 1, 1);
        var toDate = new DateTime(2024, 12, 31);

        // Act
        var result = await _controller.GetAuditLogs(
            page: 2,
            pageSize: 50,
            entityName: "User",
            action: "Created",
            fromDate: fromDate,
            toDate: toDate);

        // Assert
        _mockMediator.Verify(
            m => m.Send(
                It.Is<GetAuditLogsQuery>(q =>
                    q.Page == 2 &&
                    q.PageSize == 50 &&
                    q.EntityName == "User" &&
                    q.Action == "Created" &&
                    q.FromDate == fromDate &&
                    q.ToDate == toDate),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task GetAuditLogs_ReturnsOk_WithEmptyResult()
    {
        // Arrange
        var emptyResult = PagedResult<AuditLogDto>.Create(
            new List<AuditLogDto>(), page: 1, pageSize: 20, totalItems: 0);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetAuditLogsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(emptyResult);

        // Act
        var result = await _controller.GetAuditLogs();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<PagedResult<AuditLogDto>>(okResult.Value);
        Assert.Empty(response.Items);
        Assert.Equal(0, response.Pagination.TotalItems);
    }
}
