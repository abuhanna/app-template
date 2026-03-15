using App.Template.Api.Data;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Controllers;

[ApiController]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public HealthController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("/health")]
    public IActionResult Check()
    {
        return Ok(new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow
        });
    }

    [HttpGet("/health/ready")]
    public async Task<IActionResult> Ready()
    {
        try
        {
            await _dbContext.Database.CanConnectAsync();
            return Ok(new
            {
                status = "ready",
                timestamp = DateTime.UtcNow,
                database = "connected"
            });
        }
        catch
        {
            return StatusCode(503, new
            {
                status = "unavailable",
                timestamp = DateTime.UtcNow,
                database = "disconnected"
            });
        }
    }

    [HttpGet("/health/live")]
    public IActionResult Live()
    {
        return Ok(new
        {
            status = "alive",
            timestamp = DateTime.UtcNow
        });
    }
}
