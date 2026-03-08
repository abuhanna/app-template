using App.Template.Api.Common.Models;
using App.Template.Api.Features.AuditLogs;
using App.Template.Api.Features.AuditLogs.Dtos;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace App.Template.Api.Tests;

public class AuditLogsControllerTests
{
    private readonly Mock<IAuditLogService> _mockAuditLogService;
    private readonly AuditLogsController _controller;

    public AuditLogsControllerTests()
    {
        _mockAuditLogService = new Mock<IAuditLogService>();
        _controller = new AuditLogsController(_mockAuditLogService.Object);
    }

    [Fact]
    public async Task GetAll_ReturnsOk_WithPaginatedAuditLogs()
    {
        var queryParams = new AuditLogsQueryParams();
        var logs = new PagedResult<AuditLogDto>
        {
            Items = new List<AuditLogDto>
            {
                new() { Id = 1, EntityType = "User", Action = "created" }
            }
        };
        _mockAuditLogService.Setup(s => s.GetAuditLogsAsync(queryParams)).ReturnsAsync(logs);

        var result = await _controller.GetAll(queryParams);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<PaginatedResponse<AuditLogDto>>(okResult.Value);
        Assert.True(value.Success);
    }

    [Fact]
    public async Task GetAll_ReturnsOk_WithEmptyResult()
    {
        var queryParams = new AuditLogsQueryParams();
        var logs = new PagedResult<AuditLogDto> { Items = new List<AuditLogDto>() };
        _mockAuditLogService.Setup(s => s.GetAuditLogsAsync(queryParams)).ReturnsAsync(logs);

        var result = await _controller.GetAll(queryParams);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<PaginatedResponse<AuditLogDto>>(okResult.Value);
        Assert.True(value.Success);
    }

    [Fact]
    public async Task GetById_ReturnsOk_WhenAuditLogExists()
    {
        var log = new AuditLogDto { Id = 1, EntityType = "User", Action = "created" };
        _mockAuditLogService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(log);

        var result = await _controller.GetById(1);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<ApiResponse<AuditLogDto>>(okResult.Value);
        Assert.True(value.Success);
        Assert.Equal("User", value.Data!.EntityType);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenAuditLogDoesNotExist()
    {
        _mockAuditLogService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync((AuditLogDto?)null);

        var result = await _controller.GetById(1);

        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
        var value = Assert.IsType<ApiResponse>(notFoundResult.Value);
        Assert.False(value.Success);
    }
}
