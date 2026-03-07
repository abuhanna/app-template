using App.Template.Api.Features.Health;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace App.Template.Api.Tests;

public class HealthControllerTests
{
    private readonly HealthController _controller;

    public HealthControllerTests()
    {
        _controller = new HealthController();
    }

    [Fact]
    public void Check_ReturnsOk_WithHealthyStatus()
    {
        var result = _controller.Check();

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }
}
