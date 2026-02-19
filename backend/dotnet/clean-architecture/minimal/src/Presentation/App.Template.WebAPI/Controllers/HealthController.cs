using AppTemplate.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AppTemplate.WebAPI.Controllers;

/// <summary>
/// Health check endpoints for monitoring and orchestration (Kubernetes, Docker, etc.)
/// </summary>
[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public HealthController(IApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Basic health check - returns application status
    /// </summary>
    [HttpGet("/health")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Health()
    {
        return Ok(new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow,
            application = "AppTemplate API",
            version = "1.0.0"
        });
    }

    /// <summary>
    /// Readiness check - verifies the application can accept traffic (database connected)
    /// Returns 503 if dependencies are not ready
    /// </summary>
    [HttpGet("/health/ready")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> Ready()
    {
        try
        {
            // Check database connectivity
            var canConnect = await _context.Database.CanConnectAsync();

            if (canConnect)
            {
                return Ok(new
                {
                    status = "ready",
                    timestamp = DateTime.UtcNow,
                    database = "connected"
                });
            }
        }
        catch
        {
            // Database connection failed
        }

        return StatusCode(StatusCodes.Status503ServiceUnavailable, new
        {
            status = "not ready",
            timestamp = DateTime.UtcNow,
            database = "disconnected"
        });
    }

    /// <summary>
    /// Liveness check - verifies the application is alive
    /// Always returns 200 if the application is responding
    /// </summary>
    [HttpGet("/health/live")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Live()
    {
        return Ok(new
        {
            status = "alive",
            timestamp = DateTime.UtcNow
        });
    }
}
