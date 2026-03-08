using App.Template.Api.Controllers;
using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace App.Template.Api.Tests;

public class DepartmentsControllerTests
{
    private readonly Mock<IDepartmentService> _mockDepartmentService;
    private readonly DepartmentsController _controller;

    public DepartmentsControllerTests()
    {
        _mockDepartmentService = new Mock<IDepartmentService>();
        _controller = new DepartmentsController(_mockDepartmentService.Object);
    }

    [Fact]
    public async Task GetAll_ReturnsOk_WithPagedDepartments()
    {
        var queryParams = new DeptQueryParams();
        var departments = new PagedResult<DepartmentDto>
        {
            Items = new List<DepartmentDto>
            {
                new() { Id = 1, Name = "IT", Code = "IT" }
            }
        };
        _mockDepartmentService.Setup(s => s.GetDepartmentsAsync(queryParams)).ReturnsAsync(departments);

        var result = await _controller.GetAll(queryParams);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task GetById_ReturnsOk_WhenDepartmentExists()
    {
        var dept = new DepartmentDto { Id = 1, Name = "IT", Code = "IT" };
        _mockDepartmentService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(dept);

        var result = await _controller.GetById(1);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<ApiResponse<DepartmentDto>>(okResult.Value);
        Assert.Equal("IT", value.Data!.Name);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenDepartmentDoesNotExist()
    {
        _mockDepartmentService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync((DepartmentDto?)null);

        var result = await _controller.GetById(1);

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task Create_Returns201_WithDepartment()
    {
        var request = new CreateDepartmentRequest { Name = "HR", Code = "HR" };
        var created = new DepartmentDto { Id = 2, Name = "HR", Code = "HR" };
        _mockDepartmentService.Setup(s => s.CreateAsync(request)).ReturnsAsync(created);

        var result = await _controller.Create(request);

        var objectResult = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(201, objectResult.StatusCode);
    }

    [Fact]
    public async Task Update_ReturnsOk_WhenDepartmentExists()
    {
        var request = new UpdateDepartmentRequest { Name = "Updated IT" };
        var updated = new DepartmentDto { Id = 1, Name = "Updated IT", Code = "IT" };
        _mockDepartmentService.Setup(s => s.UpdateAsync(1, request)).ReturnsAsync(updated);

        var result = await _controller.Update(1, request);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task Update_ReturnsNotFound_WhenDepartmentDoesNotExist()
    {
        var request = new UpdateDepartmentRequest { Name = "Updated" };
        _mockDepartmentService.Setup(s => s.UpdateAsync(1, request)).ReturnsAsync((DepartmentDto?)null);

        var result = await _controller.Update(1, request);

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenSuccessful()
    {
        _mockDepartmentService.Setup(s => s.DeleteAsync(1)).ReturnsAsync(true);

        var result = await _controller.Delete(1);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNotFound_WhenDepartmentDoesNotExist()
    {
        _mockDepartmentService.Setup(s => s.DeleteAsync(1)).ReturnsAsync(false);

        var result = await _controller.Delete(1);

        Assert.IsType<NotFoundObjectResult>(result);
    }
}
