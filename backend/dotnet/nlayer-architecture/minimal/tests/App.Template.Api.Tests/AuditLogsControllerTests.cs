using App.Template.Api.Controllers;
using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Repositories;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace App.Template.Api.Tests;

public class AuditLogsControllerTests
{
    private readonly Mock<IAuditLogRepository> _mockRepo;
    private readonly AuditLogsController _controller;

    public AuditLogsControllerTests()
    {
        _mockRepo = new Mock<IAuditLogRepository>();
        _controller = new AuditLogsController(_mockRepo.Object);
    }

    [Fact]
    public async Task GetAuditLogs_ReturnsOk_WithPagedResult()
    {
        var result = new PagedResult<AuditLogDto>
        {
            Items = new List<AuditLogDto>
            {
                new() { Id = 1, EntityName = "User", Action = "Create" }
            }
        };
        _mockRepo
            .Setup(r => r.GetPagedAsync(1, 20, null, "desc", null, null, null, null, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(result);

        var actionResult = await _controller.GetAuditLogs();

        Assert.IsType<OkObjectResult>(actionResult);
    }

    [Fact]
    public async Task GetAuditLogs_ReturnsOk_WithEmptyResult()
    {
        var result = new PagedResult<AuditLogDto> { Items = new List<AuditLogDto>() };
        _mockRepo
            .Setup(r => r.GetPagedAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string?>(), It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<DateTime?>(), It.IsAny<DateTime?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(result);

        var actionResult = await _controller.GetAuditLogs();

        Assert.IsType<OkObjectResult>(actionResult);
    }
}
