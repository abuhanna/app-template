using App.Template.Api.Data;
using App.Template.Api.Features.Health;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace App.Template.Api.Tests;

public class HealthControllerTests
{
    private readonly HealthController _controller;

    public HealthControllerTests()
    {
        // HealthController requires AppDbContext, but Health() and Live() don't use it.
        // Pass null and cast — these endpoints never touch the database.
        _controller = new HealthController(null!);
    }

    [Fact]
    public void Health_ReturnsOkResult_WithHealthyStatus()
    {
        // Act
        var result = _controller.Health();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        // Verify the anonymous object contains the expected status
        var value = okResult.Value;
        var statusProp = value.GetType().GetProperty("status");
        Assert.NotNull(statusProp);
        Assert.Equal("healthy", statusProp.GetValue(value));
    }

    [Fact]
    public void Live_ReturnsOkResult_WithAliveStatus()
    {
        // Act
        var result = _controller.Live();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        // Verify the anonymous object contains the expected status
        var value = okResult.Value;
        var statusProp = value.GetType().GetProperty("status");
        Assert.NotNull(statusProp);
        Assert.Equal("alive", statusProp.GetValue(value));
    }
}
