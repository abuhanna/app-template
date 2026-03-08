using App.Template.Api.Controllers;
using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Services;
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
    public async Task GetAll_ReturnsOk_WithPagedAuditLogs()
    {
        var queryParams = new AuditLogsQueryParams();
        var logs = new PagedResult<AuditLogDto>
        {
            Items = new List<AuditLogDto>
            {
                new() { Id = 1, EntityType = "User", Action = "create" }
            }
        };
        _mockAuditLogService.Setup(s => s.GetAuditLogsAsync(queryParams)).ReturnsAsync(logs);

        var result = await _controller.GetAll(queryParams);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task GetById_ReturnsOk_WhenExists()
    {
        var log = new AuditLogDto { Id = 1, EntityType = "User", Action = "create" };
        _mockAuditLogService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(log);

        var result = await _controller.GetById(1);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenDoesNotExist()
    {
        _mockAuditLogService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync((AuditLogDto?)null);

        var result = await _controller.GetById(1);

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }
}
