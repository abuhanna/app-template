using App.Template.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly IFileService _fileService;

    public FilesController(IFileService fileService)
    {
        _fileService = fileService;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("File is empty");

        var result = await _fileService.UploadFileAsync(file);
        return Ok(new { result.Id, result.FileName });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Download(int id)
    {
        var fileData = await _fileService.GetFileAsync(id);
        if (fileData == null)
            return NotFound();

        return File(fileData.Value.Stream, fileData.Value.ContentType, fileData.Value.FileName);
    }
}
