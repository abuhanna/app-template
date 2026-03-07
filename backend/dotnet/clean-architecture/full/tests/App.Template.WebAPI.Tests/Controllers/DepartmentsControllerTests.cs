using AppTemplate.Application.Common.Models;
using AppTemplate.Application.DTOs;
using AppTemplate.Application.Features.DepartmentManagement.Commands.CreateDepartment;
using AppTemplate.Application.Features.DepartmentManagement.Commands.DeleteDepartment;
using AppTemplate.Application.Features.DepartmentManagement.Commands.UpdateDepartment;
using AppTemplate.Application.Features.DepartmentManagement.Queries.GetDepartmentById;
using AppTemplate.Application.Features.DepartmentManagement.Queries.GetDepartments;
using AppTemplate.WebAPI.Controllers;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace AppTemplate.WebAPI.Tests.Controllers;

public class DepartmentsControllerTests
{
    private readonly Mock<ISender> _mockMediator;
    private readonly DepartmentsController _controller;

    public DepartmentsControllerTests()
    {
        _mockMediator = new Mock<ISender>();
        _controller = new DepartmentsController(_mockMediator.Object);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
    }

    #region GetDepartments

    [Fact]
    public async Task GetDepartments_ReturnsOk_WithPagedResult()
    {
        // Arrange
        var pagedResult = PagedResult<DepartmentDto>.Create(
            new List<DepartmentDto>
            {
                new() { Id = 1, Code = "IT", Name = "IT Department" },
                new() { Id = 2, Code = "HR", Name = "Human Resources" }
            },
            page: 1, pageSize: 10, totalItems: 2);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetDepartmentsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(pagedResult);

        // Act
        var result = await _controller.GetDepartments();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<PagedResult<DepartmentDto>>(okResult.Value);
        Assert.Equal(2, response.Items.Count);
    }

    #endregion

    #region GetDepartmentById

    [Fact]
    public async Task GetDepartmentById_ReturnsOk_WhenDepartmentExists()
    {
        // Arrange
        var departmentDto = new DepartmentDto { Id = 1, Code = "IT", Name = "IT Department" };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetDepartmentByIdQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(departmentDto);

        // Act
        var result = await _controller.GetDepartmentById(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<DepartmentDto>(okResult.Value);
        Assert.Equal("IT", response.Code);
        Assert.Equal("IT Department", response.Name);
    }

    [Fact]
    public async Task GetDepartmentById_ReturnsNotFound_WhenDepartmentDoesNotExist()
    {
        // Arrange
        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetDepartmentByIdQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((DepartmentDto?)null);

        // Act
        var result = await _controller.GetDepartmentById(999);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal(404, notFoundResult.StatusCode);
    }

    #endregion

    #region CreateDepartment

    [Fact]
    public async Task CreateDepartment_ReturnsCreatedAtAction_WhenSuccessful()
    {
        // Arrange
        var request = new CreateDepartmentRequest
        {
            Code = "FIN",
            Name = "Finance",
            Description = "Finance Department"
        };

        var createdDepartment = new DepartmentDto
        {
            Id = 3,
            Code = "FIN",
            Name = "Finance",
            Description = "Finance Department",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<CreateDepartmentCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdDepartment);

        // Act
        var result = await _controller.CreateDepartment(request);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(201, createdResult.StatusCode);
        Assert.Equal(nameof(DepartmentsController.GetDepartmentById), createdResult.ActionName);
        var response = Assert.IsType<DepartmentDto>(createdResult.Value);
        Assert.Equal(3, response.Id);
        Assert.Equal("FIN", response.Code);
    }

    #endregion

    #region UpdateDepartment

    [Fact]
    public async Task UpdateDepartment_ReturnsOk_WhenSuccessful()
    {
        // Arrange
        var request = new UpdateDepartmentRequest
        {
            Name = "Updated IT Department",
            IsActive = true
        };

        var updatedDepartment = new DepartmentDto
        {
            Id = 1,
            Code = "IT",
            Name = "Updated IT Department",
            IsActive = true
        };

        _mockMediator
            .Setup(m => m.Send(It.IsAny<UpdateDepartmentCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedDepartment);

        // Act
        var result = await _controller.UpdateDepartment(1, request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<DepartmentDto>(okResult.Value);
        Assert.Equal("Updated IT Department", response.Name);
    }

    #endregion

    #region DeleteDepartment

    [Fact]
    public async Task DeleteDepartment_ReturnsNoContent_WhenSuccessful()
    {
        // Arrange
        _mockMediator
            .Setup(m => m.Send(It.IsAny<DeleteDepartmentCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteDepartment(1);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    #endregion
}
