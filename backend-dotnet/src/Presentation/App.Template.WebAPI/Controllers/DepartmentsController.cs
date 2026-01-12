using AppTemplate.Application.DTOs;
using AppTemplate.Application.Features.DepartmentManagement.Commands.CreateDepartment;
using AppTemplate.Application.Features.DepartmentManagement.Commands.DeleteDepartment;
using AppTemplate.Application.Features.DepartmentManagement.Commands.UpdateDepartment;
using AppTemplate.Application.Features.DepartmentManagement.Queries.GetDepartmentById;
using AppTemplate.Application.Features.DepartmentManagement.Queries.GetDepartments;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppTemplate.WebAPI.Controllers;

/// <summary>
/// Department management endpoints
/// </summary>
[Authorize]
[ApiController]
[Route("api/departments")]
public class DepartmentsController : ControllerBase
{
    private readonly ISender _mediator;

    public DepartmentsController(ISender mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get list of departments
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<DepartmentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDepartments(
        [FromQuery] bool? isActive,
        [FromQuery] string? search)
    {
        var query = new GetDepartmentsQuery
        {
            IsActive = isActive,
            Search = search
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get department by ID
    /// </summary>
    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(DepartmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDepartmentById(long id)
    {
        var query = new GetDepartmentByIdQuery { Id = id };
        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound(new { message = $"Department with ID {id} not found" });
        }

        return Ok(result);
    }

    /// <summary>
    /// Create a new department
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(DepartmentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateDepartment([FromBody] CreateDepartmentRequest request)
    {
        var command = new CreateDepartmentCommand
        {
            Code = request.Code,
            Name = request.Name,
            Description = request.Description
        };

        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetDepartmentById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Update an existing department
    /// </summary>
    [HttpPut("{id:long}")]
    [ProducesResponseType(typeof(DepartmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateDepartment(long id, [FromBody] UpdateDepartmentRequest request)
    {
        var command = new UpdateDepartmentCommand
        {
            Id = id,
            Code = request.Code,
            Name = request.Name,
            Description = request.Description,
            IsActive = request.IsActive
        };

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Delete (deactivate) a department
    /// </summary>
    [HttpDelete("{id:long}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteDepartment(long id)
    {
        var command = new DeleteDepartmentCommand { Id = id };
        await _mediator.Send(command);
        return NoContent();
    }
}
