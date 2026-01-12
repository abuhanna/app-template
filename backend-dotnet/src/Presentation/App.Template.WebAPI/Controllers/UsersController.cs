using AppTemplate.Application.DTOs;
using AppTemplate.Application.Features.UserManagement.Commands.ChangePassword;
using AppTemplate.Application.Features.UserManagement.Commands.CreateUser;
using AppTemplate.Application.Features.UserManagement.Commands.DeleteUser;
using AppTemplate.Application.Features.UserManagement.Commands.UpdateUser;
using AppTemplate.Application.Features.UserManagement.Queries.GetUserById;
using AppTemplate.Application.Features.UserManagement.Queries.GetUsers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppTemplate.WebAPI.Controllers;

/// <summary>
/// User management endpoints
/// </summary>
[Authorize]
[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly ISender _mediator;

    public UsersController(ISender mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get list of users
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<UserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUsers(
        [FromQuery] bool? isActive,
        [FromQuery] long? departmentId,
        [FromQuery] string? search)
    {
        var query = new GetUsersQuery
        {
            IsActive = isActive,
            DepartmentId = departmentId,
            Search = search
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserById(long id)
    {
        var query = new GetUserByIdQuery { Id = id };
        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound(new { message = $"User with ID {id} not found" });
        }

        return Ok(result);
    }

    /// <summary>
    /// Create a new user
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        var command = new CreateUserCommand
        {
            Username = request.Username,
            Email = request.Email,
            Password = request.Password,
            Name = request.Name,
            Role = request.Role,
            DepartmentId = request.DepartmentId
        };

        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetUserById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Update an existing user
    /// </summary>
    [HttpPut("{id:long}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUser(long id, [FromBody] UpdateUserRequest request)
    {
        var command = new UpdateUserCommand
        {
            Id = id,
            Email = request.Email,
            Name = request.Name,
            Role = request.Role,
            DepartmentId = request.DepartmentId,
            IsActive = request.IsActive
        };

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Delete (deactivate) a user
    /// </summary>
    [HttpDelete("{id:long}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUser(long id)
    {
        var command = new DeleteUserCommand { Id = id };
        await _mediator.Send(command);
        return NoContent();
    }

    /// <summary>
    /// Change user password
    /// </summary>
    [HttpPost("{id:long}/change-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ChangePassword(long id, [FromBody] ChangePasswordRequest request)
    {
        var command = new ChangePasswordCommand
        {
            UserId = id,
            CurrentPassword = request.CurrentPassword,
            NewPassword = request.NewPassword
        };

        await _mediator.Send(command);
        return Ok(new { message = "Password changed successfully" });
    }
}
