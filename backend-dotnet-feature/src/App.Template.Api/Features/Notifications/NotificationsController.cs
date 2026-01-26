using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Features.Notifications;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
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
