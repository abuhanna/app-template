using AppTemplate.Application.Common.Models;
using AppTemplate.Application.DTOs;
using AppTemplate.Application.Features.AuditLogManagement.Queries.GetAuditLogs;
using AppTemplate.Application.Features.DepartmentManagement.Queries.GetDepartments;
using AppTemplate.Application.Features.UserManagement.Queries.GetUsers;
using AppTemplate.Application.Interfaces;
using AppTemplate.WebAPI.Controllers;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace AppTemplate.WebAPI.Tests.Controllers;

public class ExportControllerTests
{
    private readonly Mock<ISender> _mockMediator;
    private readonly Mock<IExportService> _mockExportService;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly ExportController _controller;

    public ExportControllerTests()
    {
        _mockMediator = new Mock<ISender>();
        _mockExportService = new Mock<IExportService>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _controller = new ExportController(
            _mockMediator.Object,
            _mockExportService.Object,
            _mockCurrentUserService.Object);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
    }

    [Fact]
    public async Task ExportUsers_ReturnsFile_WithDefaultXlsxFormat()
    {
        // Arrange
        var usersResult = PagedResult<UserDto>.Create(
            new List<UserDto>
            {
                new()
                {
                    Id = 1,
                    Username = "admin",
                    Email = "admin@example.com",
                    FirstName = "Admin",
                    LastName = "User",
                    FullName = "Admin User",
                    Role = "Admin",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            },
            page: 1, pageSize: 10000, totalItems: 1);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetUsersQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(usersResult);

        var excelContent = "excel content"u8.ToArray();
        var exportResult = new ExportResult(
            new MemoryStream(excelContent),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "users.xlsx");

        _mockExportService
            .Setup(s => s.ExportToExcelAsync(It.IsAny<IEnumerable<object>>(), "users", "Users", It.IsAny<CancellationToken>()))
            .ReturnsAsync(exportResult);

        // Act
        var result = await _controller.ExportUsers();

        // Assert
        var fileResult = Assert.IsType<FileStreamResult>(result);
        Assert.Equal("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileResult.ContentType);
        Assert.Equal("users.xlsx", fileResult.FileDownloadName);
    }

    [Fact]
    public async Task ExportDepartments_ReturnsFile_WithCsvFormat()
    {
        // Arrange
        var deptResult = PagedResult<DepartmentDto>.Create(
            new List<DepartmentDto>
            {
                new()
                {
                    Id = 1,
                    Code = "IT",
                    Name = "IT Department",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            },
            page: 1, pageSize: 10000, totalItems: 1);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetDepartmentsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(deptResult);

        var csvContent = "csv content"u8.ToArray();
        var exportResult = new ExportResult(
            new MemoryStream(csvContent),
            "text/csv",
            "departments.csv");

        _mockExportService
            .Setup(s => s.ExportToCsvAsync(It.IsAny<IEnumerable<object>>(), "departments", It.IsAny<CancellationToken>()))
            .ReturnsAsync(exportResult);

        // Act
        var result = await _controller.ExportDepartments(format: "csv");

        // Assert
        var fileResult = Assert.IsType<FileStreamResult>(result);
        Assert.Equal("text/csv", fileResult.ContentType);
        Assert.Equal("departments.csv", fileResult.FileDownloadName);
    }

    [Fact]
    public async Task ExportAuditLogs_ReturnsFile_WithXlsxFormat()
    {
        // Arrange
        var auditResult = PagedResult<AuditLogDto>.Create(
            new List<AuditLogDto>
            {
                new()
                {
                    Id = 1,
                    EntityName = "User",
                    EntityId = "1",
                    Action = "Created",
                    UserId = "admin",
                    Timestamp = DateTime.UtcNow
                }
            },
            page: 1, pageSize: 1000, totalItems: 1);

        _mockMediator
            .Setup(m => m.Send(It.IsAny<GetAuditLogsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(auditResult);

        var excelContent = "excel content"u8.ToArray();
        var exportResult = new ExportResult(
            new MemoryStream(excelContent),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "audit_logs.xlsx");

        _mockExportService
            .Setup(s => s.ExportToExcelAsync(It.IsAny<IEnumerable<object>>(), "audit_logs", "Audit Logs", It.IsAny<CancellationToken>()))
            .ReturnsAsync(exportResult);

        // Act
        var result = await _controller.ExportAuditLogs();

        // Assert
        var fileResult = Assert.IsType<FileStreamResult>(result);
        Assert.Equal("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileResult.ContentType);
        Assert.Equal("audit_logs.xlsx", fileResult.FileDownloadName);
    }
}
