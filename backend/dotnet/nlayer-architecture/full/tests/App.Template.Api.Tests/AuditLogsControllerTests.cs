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
                new() { Id = 1, EntityName = "User", Action = "Create" }
            }
        };
        _mockAuditLogService.Setup(s => s.GetAuditLogsAsync(queryParams)).ReturnsAsync(logs);

        var result = await _controller.GetAll(queryParams);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task GetAll_ReturnsOk_WithEmptyResult()
    {
        var queryParams = new AuditLogsQueryParams();
        var logs = new PagedResult<AuditLogDto> { Items = new List<AuditLogDto>() };
        _mockAuditLogService.Setup(s => s.GetAuditLogsAsync(queryParams)).ReturnsAsync(logs);

        var result = await _controller.GetAll(queryParams);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }
}
