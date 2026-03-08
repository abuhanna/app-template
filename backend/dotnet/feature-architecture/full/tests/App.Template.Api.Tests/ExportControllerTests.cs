using System.Security.Claims;
using App.Template.Api.Common.Models;
using App.Template.Api.Common.Services;
using App.Template.Api.Features.AuditLogs;
using App.Template.Api.Features.AuditLogs.Dtos;
using App.Template.Api.Features.Departments;
using App.Template.Api.Features.Departments.Dtos;
using App.Template.Api.Features.Export;
using App.Template.Api.Features.Notifications;
using App.Template.Api.Features.Notifications.Dtos;
using App.Template.Api.Features.Users;
using App.Template.Api.Features.Users.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace App.Template.Api.Tests;

public class ExportControllerTests
{
    private readonly Mock<IExportService> _mockExportService;
    private readonly Mock<IUserService> _mockUserService;
    private readonly Mock<IDepartmentService> _mockDeptService;
    private readonly Mock<IAuditLogService> _mockAuditLogService;
    private readonly Mock<INotificationService> _mockNotificationService;
    private readonly ExportController _controller;

    public ExportControllerTests()
    {
        _mockExportService = new Mock<IExportService>();
        _mockUserService = new Mock<IUserService>();
        _mockDeptService = new Mock<IDepartmentService>();
        _mockAuditLogService = new Mock<IAuditLogService>();
        _mockNotificationService = new Mock<INotificationService>();
        _controller = new ExportController(
            _mockExportService.Object,
            _mockUserService.Object,
            _mockDeptService.Object,
            _mockAuditLogService.Object,
            _mockNotificationService.Object);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, "1") };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        _controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(identity);
    }

    [Fact]
    public async Task ExportUsers_ReturnsExcelFile()
    {
        var users = new PagedResult<UserDto> { Items = new List<UserDto> { new() { Id = 1, Username = "user1" } } };
        _mockUserService.Setup(s => s.GetUsersAsync(It.IsAny<UsersQueryParams>())).ReturnsAsync(users);
        _mockExportService.Setup(s => s.ExportToExcelAsync(It.IsAny<IEnumerable<UserDto>>(), It.IsAny<string>())).ReturnsAsync(new byte[] { 1, 2, 3 });

        var result = await _controller.ExportUsers();

        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileResult.ContentType);
    }

    [Fact]
    public async Task ExportUsers_ReturnsCsvFile()
    {
        var users = new PagedResult<UserDto> { Items = new List<UserDto> { new() { Id = 1, Username = "user1" } } };
        _mockUserService.Setup(s => s.GetUsersAsync(It.IsAny<UsersQueryParams>())).ReturnsAsync(users);
        var csvBytes = System.Text.Encoding.UTF8.GetBytes("Username\nuser1");
        _mockExportService.Setup(s => s.ExportToCsvAsync(It.IsAny<IEnumerable<UserDto>>())).ReturnsAsync(csvBytes);

        var result = await _controller.ExportUsers("csv");

        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal("text/csv", fileResult.ContentType);
    }

    [Fact]
    public async Task ExportDepartments_ReturnsExcelFile()
    {
        var depts = new PagedResult<DepartmentDto> { Items = new List<DepartmentDto> { new() { Id = 1, Name = "IT" } } };
        _mockDeptService.Setup(s => s.GetDepartmentsAsync(It.IsAny<DeptQueryParams>())).ReturnsAsync(depts);
        _mockExportService.Setup(s => s.ExportToExcelAsync(It.IsAny<IEnumerable<DepartmentDto>>(), It.IsAny<string>())).ReturnsAsync(new byte[] { 1, 2, 3 });

        var result = await _controller.ExportDepartments();

        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileResult.ContentType);
    }

    [Fact]
    public async Task ExportAuditLogs_ReturnsPdfFile()
    {
        var logs = new PagedResult<AuditLogDto> { Items = new List<AuditLogDto> { new() { Id = 1, EntityType = "User" } } };
        _mockAuditLogService.Setup(s => s.GetAuditLogsAsync(It.IsAny<AuditLogsQueryParams>())).ReturnsAsync(logs);
        _mockExportService.Setup(s => s.ExportToPdfAsync(It.IsAny<IEnumerable<AuditLogDto>>(), It.IsAny<string>())).ReturnsAsync(new byte[] { 1, 2, 3 });

        var result = await _controller.ExportAuditLogs("pdf");

        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal("application/pdf", fileResult.ContentType);
    }
}
