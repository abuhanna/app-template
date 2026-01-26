using App.Template.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ExportController : ControllerBase
{
    private readonly IExportService _exportService;

    public ExportController(IExportService exportService)
    {
        _exportService = exportService;
    }

    [HttpPost("csv")]
    public async Task<IActionResult> ExportCsv([FromBody] List<object> data)
    {
        var result = await _exportService.ExportToCsvAsync(data);
        return File(result, "text/csv", $"export_{DateTime.Now:yyyyMMddHHmmss}.csv");
    }

    [HttpPost("excel")]
    public async Task<IActionResult> ExportExcel([FromBody] List<object> data)
    {
        var result = await _exportService.ExportToExcelAsync(data);
        return File(result, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"export_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
    }

    [HttpPost("pdf")]
    public async Task<IActionResult> ExportPdf([FromBody] List<object> data)
    {
        var result = await _exportService.ExportToPdfAsync(data, "Export Report");
        return File(result, "application/pdf", $"export_{DateTime.Now:yyyyMMddHHmmss}.pdf");
    }
}
