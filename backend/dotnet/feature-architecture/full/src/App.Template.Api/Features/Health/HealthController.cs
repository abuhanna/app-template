using App.Template.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace App.Template.Api.Features.Health;

[ApiController]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _context;

    public HealthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("health")]
    public IActionResult Check()
    {
        return Ok(new
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Version = "1.0.0"
        });
    }

    [HttpGet("health/ready")]
    public async Task<IActionResult> Ready()
    {
        try
        {
            await _context.Database.CanConnectAsync();
            return Ok(new
            {
                Status = "Ready",
                Timestamp = DateTime.UtcNow,
                Database = "Connected"
            });
        }
        catch (Exception)
        {
            return StatusCode(503, new
            {
                Status = "Not Ready",
                Timestamp = DateTime.UtcNow,
                Database = "Disconnected"
            });
        }
    }

    [HttpGet("health/live")]
    public IActionResult Live()
    {
        return Ok(new
        {
            Status = "Alive",
            Timestamp = DateTime.UtcNow
        });
    }
}
