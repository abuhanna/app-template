using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/departments")]
public class DepartmentsController : ControllerBase
{
    private readonly IDepartmentService _departmentService;

    public DepartmentsController(IDepartmentService departmentService)
    {
        _departmentService = departmentService;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<DepartmentDto>>> GetAll([FromQuery] DeptQueryParams queryParams)
    {
        var result = await _departmentService.GetDepartmentsAsync(queryParams);
        return Ok(PaginatedResponse<DepartmentDto>.From(result, "Departments retrieved successfully"));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> GetById(long id)
    {
        var dept = await _departmentService.GetByIdAsync(id);
        if (dept == null) return NotFound(ApiResponse.Fail("Department not found"));
        return Ok(ApiResponse.Ok(dept, "Department retrieved successfully"));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> Create(CreateDepartmentRequest request)
    {
        var created = await _departmentService.CreateAsync(request);
        return StatusCode(201, ApiResponse.Ok(created, "Department created successfully"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> Update(long id, UpdateDepartmentRequest request)
    {
        var updated = await _departmentService.UpdateAsync(id, request);
        if (updated == null) return NotFound(ApiResponse.Fail("Department not found"));
        return Ok(ApiResponse.Ok(updated, "Department updated successfully"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(long id)
    {
        var deleted = await _departmentService.DeleteAsync(id);
        if (!deleted) return NotFound(ApiResponse.Fail("Department not found"));
        return NoContent();
    }
}
