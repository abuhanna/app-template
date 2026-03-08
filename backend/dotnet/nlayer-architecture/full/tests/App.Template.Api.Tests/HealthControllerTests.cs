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
    [Fact]
    public void Check_ReturnsOk_WithHealthyStatus()
    {
        var mockCurrentUserService = new Mock<ICurrentUserService>();
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("HealthTest_" + Guid.NewGuid())
            .Options;
        using var dbContext = new AppDbContext(options, mockCurrentUserService.Object);
        var controller = new HealthController(dbContext);

        var result = controller.Check();

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }
}
