using App.Template.Api.Controllers;
using App.Template.Api.Data;
using App.Template.Api.Services;
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
        // Build real DbContextOptions (no provider configured — Health/Live don't touch DB)
        var options = new DbContextOptionsBuilder<AppDbContext>().Options;
        var mockCurrentUserService = new Mock<ICurrentUserService>();
        var context = new Mock<AppDbContext>(options, mockCurrentUserService.Object) { CallBase = false };
        _controller = new HealthController(context.Object);
    }

    [Fact]
    public void Health_ReturnsOkObjectResult_WithHealthyStatus()
    {
        // Act
        var result = _controller.Health();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        var value = okResult.Value;
        var statusProp = value.GetType().GetProperty("status");
        Assert.NotNull(statusProp);
        Assert.Equal("healthy", statusProp.GetValue(value));
    }

    [Fact]
    public void Health_ReturnsOkObjectResult_WithApplicationName()
    {
        // Act
        var result = _controller.Health();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        var value = okResult.Value;
        var appProp = value.GetType().GetProperty("application");
        Assert.NotNull(appProp);
        Assert.Equal("AppTemplate API", appProp.GetValue(value));
    }

    [Fact]
    public void Health_ReturnsOkObjectResult_WithTimestamp()
    {
        // Act
        var result = _controller.Health();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        var value = okResult.Value;
        var timestampProp = value.GetType().GetProperty("timestamp");
        Assert.NotNull(timestampProp);

        var timestamp = (DateTime)timestampProp.GetValue(value)!;
        Assert.True((DateTime.UtcNow - timestamp).TotalSeconds < 5);
    }

    [Fact]
    public void Live_ReturnsOkObjectResult_WithAliveStatus()
    {
        // Act
        var result = _controller.Live();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        var value = okResult.Value;
        var statusProp = value.GetType().GetProperty("status");
        Assert.NotNull(statusProp);
        Assert.Equal("alive", statusProp.GetValue(value));
    }

    [Fact]
    public void Live_ReturnsOkObjectResult_WithTimestamp()
    {
        // Act
        var result = _controller.Live();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        var value = okResult.Value;
        var timestampProp = value.GetType().GetProperty("timestamp");
        Assert.NotNull(timestampProp);

        var timestamp = (DateTime)timestampProp.GetValue(value)!;
        Assert.True((DateTime.UtcNow - timestamp).TotalSeconds < 5);
    }
}
