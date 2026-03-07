using AppTemplate.Application.Interfaces;
using AppTemplate.WebAPI.Controllers;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace AppTemplate.WebAPI.Tests.Controllers;

public class HealthControllerTests
{
    private readonly HealthController _controller;

    public HealthControllerTests()
    {
        var mockContext = new Mock<IApplicationDbContext>();
        _controller = new HealthController(mockContext.Object);
    }

    [Fact]
    public void Health_ReturnsOk()
    {
        var result = _controller.Health();

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
}
