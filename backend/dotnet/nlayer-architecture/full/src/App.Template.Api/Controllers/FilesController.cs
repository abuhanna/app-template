using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly IFileService _fileService;

    public FilesController(IFileService fileService)
    {
        _fileService = fileService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<UploadedFileDto>>> GetAll([FromQuery] FilesQueryParams queryParams)
    {
        return Ok(await _fileService.GetFilesAsync(queryParams));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UploadedFileDto>> GetMetadata(long id)
    {
        var metadata = await _fileService.GetMetadataAsync(id);
        if (metadata == null) return NotFound();
        return Ok(metadata);
    }

    [HttpPost]
    [RequestSizeLimit(52428800)]
    public async Task<ActionResult<UploadedFileDto>> Upload(
        IFormFile file,
        [FromForm] string? description = null,
        [FromForm] string? category = null,
        [FromForm] bool isPublic = false)
    {
        if (file == null || file.Length == 0)
            return BadRequest("File is empty");

        var result = await _fileService.UploadAsync(file, description, category, isPublic);
        return CreatedAtAction(nameof(GetMetadata), new { id = result.Id }, result);
    }

    [AllowAnonymous]
    [HttpGet("{id}/download")]
    public async Task<IActionResult> Download(long id)
    {
        var fileData = await _fileService.DownloadAsync(id);
        if (fileData == null) return NotFound();
        return File(fileData.Value.Stream, fileData.Value.ContentType, fileData.Value.FileName);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(long id)
    {
        var deleted = await _fileService.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
