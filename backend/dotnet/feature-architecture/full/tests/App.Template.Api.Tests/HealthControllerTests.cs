using App.Template.Api.Common.Services;
using App.Template.Api.Data;
using App.Template.Api.Features.Health;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace App.Template.Api.Tests;

public class HealthControllerTests
{
    private readonly HealthController _controller;

    public HealthControllerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: "HealthTestDb_" + Guid.NewGuid())
            .Options;
        var mockCurrentUserService = new Mock<ICurrentUserService>();
        mockCurrentUserService.Setup(s => s.UserId).Returns("test-user");
        var context = new AppDbContext(options, mockCurrentUserService.Object);
        _controller = new HealthController(context);
    }

    [Fact]
    public void Check_ReturnsOk_WithHealthyStatus()
    {
        var result = _controller.Check();

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public void Live_ReturnsOk()
    {
        var result = _controller.Live();

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task Ready_ReturnsOk_WhenDatabaseConnected()
    {
        var result = await _controller.Ready();

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }
}
