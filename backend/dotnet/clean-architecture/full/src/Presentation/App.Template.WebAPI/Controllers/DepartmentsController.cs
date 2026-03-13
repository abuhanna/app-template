using AppTemplate.Application.Common.Models;
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
    /// Get list of departments with pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<DepartmentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDepartments(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = "desc",
        [FromQuery] bool? isActive = null,
        [FromQuery] string? search = null)
    {
        var query = new GetDepartmentsQuery
        {
            Page = Math.Max(1, page),
            PageSize = Math.Clamp(pageSize, 1, 100),
            SortBy = sortBy,
            SortOrder = sortOrder,
            IsActive = isActive,
            Search = search
        };
        var result = await _mediator.Send(query);
        return Ok(PaginatedResponse<DepartmentDto>.From(result));
    }

    /// <summary>
    /// Get department by ID
    /// </summary>
    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(ApiResponse<DepartmentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDepartmentById(long id)
    {
        var query = new GetDepartmentByIdQuery { Id = id };
        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound(ApiResponse.Fail($"Department with ID {id} not found"));
        }

        return Ok(ApiResponse.Ok(result));
    }

    /// <summary>
    /// Create a new department
    /// </summary>
    [Authorize(Roles = "admin")]
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<DepartmentDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateDepartment([FromBody] CreateDepartmentRequest request)
    {
        var command = new CreateDepartmentCommand
        {
            Code = request.Code,
            Name = request.Name,
            Description = request.Description
        };

        var result = await _mediator.Send(command);
        return StatusCode(StatusCodes.Status201Created, ApiResponse.Ok(result, "Department created successfully"));
    }

    /// <summary>
    /// Update an existing department
    /// </summary>
    [Authorize(Roles = "admin")]
    [HttpPut("{id:long}")]
    [ProducesResponseType(typeof(ApiResponse<DepartmentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
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
        return Ok(ApiResponse.Ok(result, "Department updated successfully"));
    }

    /// <summary>
    /// Delete (deactivate) a department
    /// </summary>
    [Authorize(Roles = "admin")]
    [HttpDelete("{id:long}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteDepartment(long id)
    {
        var command = new DeleteDepartmentCommand { Id = id };
        await _mediator.Send(command);
        return NoContent();
    }
}
