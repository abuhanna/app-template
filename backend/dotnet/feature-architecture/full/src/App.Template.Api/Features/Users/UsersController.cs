using App.Template.Api.Common.Models;
using App.Template.Api.Features.Users.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Features.Users;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<UserDto>>> GetAll([FromQuery] UsersQueryParams queryParams)
    {
        var result = await _userService.GetUsersAsync(queryParams);
        return Ok(PaginatedResponse<UserDto>.From(result));
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetById(long id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user == null) return NotFound(ApiResponse.Fail("User not found"));
        return Ok(ApiResponse.Ok(user));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<UserDto>>> Create([FromBody] CreateUserRequest request)
    {
        var user = await _userService.CreateUserAsync(request);
        return StatusCode(201, ApiResponse.Ok(user, "User created successfully"));
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> Update(long id, [FromBody] UpdateUserRequest request)
    {
        var user = await _userService.UpdateUserAsync(id, request);
        if (user == null) return NotFound(ApiResponse.Fail("User not found"));
        return Ok(ApiResponse.Ok(user, "User updated successfully"));
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        var result = await _userService.DeleteUserAsync(id);
        if (!result) return NotFound(ApiResponse.Fail("User not found"));
        return NoContent();
    }
}
