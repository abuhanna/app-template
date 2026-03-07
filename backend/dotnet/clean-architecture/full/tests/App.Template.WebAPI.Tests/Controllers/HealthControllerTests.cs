using AppTemplate.Application.Interfaces;
using AppTemplate.WebAPI.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Moq;

namespace AppTemplate.WebAPI.Tests.Controllers;

public class HealthControllerTests
{
    private readonly Mock<IApplicationDbContext> _mockContext;
    private readonly Mock<DatabaseFacade> _mockDatabase;
    private readonly HealthController _controller;

    public HealthControllerTests()
    {
        _mockContext = new Mock<IApplicationDbContext>();

        // DatabaseFacade requires a DbContext instance; we use a mock that satisfies the constructor
        var mockDbContext = new Mock<DbContext>();
        _mockDatabase = new Mock<DatabaseFacade>(mockDbContext.Object);

        _mockContext.Setup(c => c.Database).Returns(_mockDatabase.Object);

        _controller = new HealthController(_mockContext.Object);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
    }

    [Fact]
    public void Health_ReturnsOk_Always()
    {
        // Act
        var result = _controller.Health();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task Ready_ReturnsOk_WhenDatabaseIsConnected()
    {
        // Arrange
        _mockDatabase
            .Setup(d => d.CanConnectAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.Ready();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task Ready_Returns503_WhenDatabaseIsNotConnected()
    {
        // Arrange
        _mockDatabase
            .Setup(d => d.CanConnectAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.Ready();

        // Assert
        var statusCodeResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(503, statusCodeResult.StatusCode);
    }

    [Fact]
    public void Live_ReturnsOk_Always()
    {
        // Act
        var result = _controller.Live();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }
}
