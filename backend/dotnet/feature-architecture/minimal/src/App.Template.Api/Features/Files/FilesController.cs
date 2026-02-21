using App.Template.Api.Common.Models;
using App.Template.Api.Features.Files.Dtos;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Features.Files;

/// <summary>File management endpoints</summary>
[Authorize]
[ApiController]
[Route("api/files")]
public class FilesController : ControllerBase
{
    private readonly IFileService _fileService;
    private readonly ILogger<FilesController> _logger;

    public FilesController(IFileService fileService, ILogger<FilesController> logger)
    {
        _fileService = fileService;
        _logger = logger;
    }

    /// <summary>Get list of uploaded files</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<UploadedFileDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFiles(
        [FromQuery] string? category,
        [FromQuery] bool? isPublic,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _fileService.GetFilesAsync(category, isPublic, page, pageSize);
        return Ok(result);
    }

    /// <summary>Get file metadata by ID</summary>
    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(UploadedFileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetFile(long id)
    {
        var result = await _fileService.GetFileAsync(id);
        if (result == null)
            return NotFound(new { message = $"File with ID {id} not found" });

        return Ok(result);
    }

    /// <summary>Upload a new file</summary>
    [HttpPost]
    [RequestSizeLimit(50 * 1024 * 1024)] // 50MB limit
    [ProducesResponseType(typeof(UploadedFileDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadFile(
        IFormFile file,
        [FromForm] string? description,
        [FromForm] string? category,
        [FromForm] bool isPublic = false)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded" });

        _logger.LogInformation("Uploading file: {FileName}, Size: {Size}", file.FileName, file.Length);

        await using var stream = file.OpenReadStream();
        var result = await _fileService.UploadFileAsync(stream, file.FileName, file.ContentType, file.Length, description, category, isPublic);

        return CreatedAtAction(nameof(GetFile), new { id = result.Id }, result);
    }

    /// <summary>Download a file</summary>
    [HttpGet("{id:long}/download")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DownloadFile(long id)
    {
        var fileData = await _fileService.GetFileStreamAsync(id);
        if (fileData == null)
            return NotFound(new { message = $"File with ID {id} not found" });

        return File(fileData.Value.Stream, fileData.Value.ContentType, fileData.Value.FileName);
    }

    /// <summary>Delete a file</summary>
    [HttpDelete("{id:long}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteFile(long id)
    {
        var result = await _fileService.DeleteFileAsync(id);
        if (!result)
            return NotFound(new { message = $"File with ID {id} not found" });

        return NoContent();
    }
}
