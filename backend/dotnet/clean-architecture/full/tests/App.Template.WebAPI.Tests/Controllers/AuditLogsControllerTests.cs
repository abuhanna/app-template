using AppTemplate.Application.Common.Models;
using AppTemplate.Application.DTOs;
using AppTemplate.Application.Features.AuditLogManagement.Queries.GetAuditLogById;
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
    public async Task GetAuditLogs_ReturnsOk_WithPaginatedResponse()
    {
        // Arrange
        var pagedResult = PagedResult<AuditLogDto>.Create(
            new List<AuditLogDto>
            {
                new()
                {
                    Id = 1,
                    EntityType = "User",
                    EntityId = "1",
                    Action = "Created",
                    UserId = "admin",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = 2,
                    EntityType = "Department",
                    EntityId = "2",
                    Action = "Updated",
                    UserId = "admin",
                    CreatedAt = DateTime.UtcNow
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
        var response = Assert.IsType<PaginatedResponse<AuditLogDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal(2, response.Data!.Count);
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
            entityType: "User",
            action: "Created",
            fromDate: fromDate,
            toDate: toDate);

        // Assert
        _mockMediator.Verify(
            m => m.Send(
                It.Is<GetAuditLogsQuery>(q =>
                    q.Page == 2 &&
                    q.PageSize == 50 &&
                    q.EntityType == "User" &&
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
        var response = Assert.IsType<PaginatedResponse<AuditLogDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Empty(response.Data!);
        Assert.Equal(0, response.Pagination!.TotalItems);
    }

    [Fact]
    public async Task GetAuditLogById_ReturnsOk_WhenFound()
    {
        // Arrange
        var auditLog = new AuditLogDto
        {
            Id = 1,
            EntityType = "User",
            EntityId = "1",
            Action = "Created",
            UserId = "admin",
            CreatedAt = DateTime.UtcNow
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetAuditLogByIdQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(auditLog);

        // Act
        var result = await _controller.GetAuditLogById(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse<AuditLogDto>>(okResult.Value);
        Assert.True(response.Success);
        Assert.Equal(1, response.Data!.Id);
    }

    [Fact]
    public async Task GetAuditLogById_ReturnsNotFound_WhenNotFound()
    {
        // Arrange
        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetAuditLogByIdQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuditLogDto?)null);

        // Act
        var result = await _controller.GetAuditLogById(999);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var response = Assert.IsType<ApiResponse>(notFoundResult.Value);
        Assert.False(response.Success);
    }
}
