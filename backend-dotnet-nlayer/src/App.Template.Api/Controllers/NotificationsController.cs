using App.Template.Api.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    // Minimal implementation for now, mirroring the feature presence
    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(new List<object>()); 
    }

    [HttpPut("{id}/read")]
    public IActionResult MarkAsRead(long id)
    {
        return Ok();
    }
}
