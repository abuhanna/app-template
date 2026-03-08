using System.Security.Claims;
using App.Template.Api.Controllers;
using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace App.Template.Api.Tests;

public class ExportControllerTests
{
    private readonly Mock<IExportService> _mockExportService;
    private readonly Mock<IUserService> _mockUserService;
    private readonly Mock<IDepartmentService> _mockDepartmentService;
    private readonly Mock<IAuditLogService> _mockAuditLogService;
    private readonly Mock<INotificationService> _mockNotificationService;
    private readonly ExportController _controller;

    public ExportControllerTests()
    {
        _mockExportService = new Mock<IExportService>();
        _mockUserService = new Mock<IUserService>();
        _mockDepartmentService = new Mock<IDepartmentService>();
        _mockAuditLogService = new Mock<IAuditLogService>();
        _mockNotificationService = new Mock<INotificationService>();
        _controller = new ExportController(
            _mockExportService.Object,
            _mockUserService.Object,
            _mockDepartmentService.Object,
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
    public async Task ExportUsers_Csv_ReturnsFileResult()
    {
        var pagedResult = new PagedResult<UserDto> { Items = new List<UserDto>() };
        _mockUserService.Setup(s => s.GetUsersAsync(It.IsAny<UsersQueryParams>())).ReturnsAsync(pagedResult);
        _mockExportService.Setup(s => s.ExportToCsvAsync(It.IsAny<IEnumerable<UserDto>>())).ReturnsAsync(new byte[] { 1, 2 });

        var result = await _controller.ExportUsers(format: "csv");

        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal("text/csv", fileResult.ContentType);
    }

    [Fact]
    public async Task ExportUsers_Xlsx_ReturnsFileResult()
    {
        var pagedResult = new PagedResult<UserDto> { Items = new List<UserDto>() };
        _mockUserService.Setup(s => s.GetUsersAsync(It.IsAny<UsersQueryParams>())).ReturnsAsync(pagedResult);
        _mockExportService.Setup(s => s.ExportToExcelAsync(It.IsAny<IEnumerable<UserDto>>(), It.IsAny<string>())).ReturnsAsync(new byte[] { 1, 2 });

        var result = await _controller.ExportUsers(format: "xlsx");

        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileResult.ContentType);
    }

    [Fact]
    public async Task ExportUsers_Pdf_ReturnsFileResult()
    {
        var pagedResult = new PagedResult<UserDto> { Items = new List<UserDto>() };
        _mockUserService.Setup(s => s.GetUsersAsync(It.IsAny<UsersQueryParams>())).ReturnsAsync(pagedResult);
        _mockExportService.Setup(s => s.ExportToPdfAsync(It.IsAny<IEnumerable<UserDto>>(), It.IsAny<string>())).ReturnsAsync(new byte[] { 1, 2 });

        var result = await _controller.ExportUsers(format: "pdf");

        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal("application/pdf", fileResult.ContentType);
    }
}
