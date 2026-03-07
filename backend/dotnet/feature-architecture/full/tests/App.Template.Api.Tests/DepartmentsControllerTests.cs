using App.Template.Api.Common.Models;
using App.Template.Api.Features.Departments;
using App.Template.Api.Features.Departments.Dtos;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace App.Template.Api.Tests;

public class DepartmentsControllerTests
{
    private readonly Mock<IDepartmentService> _mockDeptService;
    private readonly DepartmentsController _controller;

    public DepartmentsControllerTests()
    {
        _mockDeptService = new Mock<IDepartmentService>();
        _controller = new DepartmentsController(_mockDeptService.Object);
    }

    [Fact]
    public async Task GetAll_ReturnsOk_WithPagedDepartments()
    {
        var queryParams = new DeptQueryParams();
        var result = new PagedResult<DepartmentDto>
        {
            Items = new List<DepartmentDto>
            {
                new() { Id = 1, Name = "IT", Code = "IT" },
                new() { Id = 2, Name = "HR", Code = "HR" }
            }
        };
        _mockDeptService.Setup(s => s.GetDepartmentsAsync(queryParams)).ReturnsAsync(result);

        var actionResult = await _controller.GetAll(queryParams);

        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task GetById_ReturnsOk_WhenDepartmentExists()
    {
        var dept = new DepartmentDto { Id = 1, Name = "IT", Code = "IT" };
        _mockDeptService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(dept);

        var result = await _controller.GetById(1);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<DepartmentDto>(okResult.Value);
        Assert.Equal("IT", value.Name);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenDepartmentDoesNotExist()
    {
        _mockDeptService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync((DepartmentDto?)null);

        var result = await _controller.GetById(1);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Create_ReturnsCreatedAtAction()
    {
        var request = new CreateDepartmentRequest { Name = "Finance", Code = "FIN" };
        var dept = new DepartmentDto { Id = 3, Name = "Finance", Code = "FIN" };
        _mockDeptService.Setup(s => s.CreateAsync(request)).ReturnsAsync(dept);

        var result = await _controller.Create(request);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal(nameof(DepartmentsController.GetById), createdResult.ActionName);
    }

    [Fact]
    public async Task Update_ReturnsOk_WhenExists()
    {
        var request = new UpdateDepartmentRequest { Name = "Updated" };
        var dept = new DepartmentDto { Id = 1, Name = "Updated" };
        _mockDeptService.Setup(s => s.UpdateAsync(1, request)).ReturnsAsync(dept);

        var result = await _controller.Update(1, request);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task Update_ReturnsNotFound_WhenDoesNotExist()
    {
        var request = new UpdateDepartmentRequest { Name = "Updated" };
        _mockDeptService.Setup(s => s.UpdateAsync(1, request)).ReturnsAsync((DepartmentDto?)null);

        var result = await _controller.Update(1, request);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenSuccessful()
    {
        _mockDeptService.Setup(s => s.DeleteAsync(1)).ReturnsAsync(true);

        var result = await _controller.Delete(1);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNotFound_WhenDoesNotExist()
    {
        _mockDeptService.Setup(s => s.DeleteAsync(1)).ReturnsAsync(false);

        var result = await _controller.Delete(1);

        Assert.IsType<NotFoundResult>(result);
    }
}
