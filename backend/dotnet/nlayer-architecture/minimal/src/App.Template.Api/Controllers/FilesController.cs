using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Controllers;

/// <summary>File management endpoints</summary>
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

    /// <summary>Get paginated list of files</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<UploadedFileDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFiles(
        [FromQuery] string? category = null,
        [FromQuery] bool? isPublic = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var result = await _fileService.GetFilesAsync(category, isPublic, page, pageSize, cancellationToken);
        return Ok(result);
    }

    /// <summary>Get file metadata by ID</summary>
    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(UploadedFileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetFile(long id, CancellationToken cancellationToken)
    {
        var file = await _fileService.GetFileAsync(id, cancellationToken);
        if (file == null) return NotFound();
        return Ok(file);
    }

    /// <summary>Upload a file</summary>
    [HttpPost]
    [RequestSizeLimit(50 * 1024 * 1024)] // 50MB limit
    [ProducesResponseType(typeof(UploadedFileDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Upload(
        IFormFile file,
        [FromForm] string? description = null,
        [FromForm] string? category = null,
        [FromForm] bool isPublic = false,
        CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "File is empty or not provided." });

        var uploadedFile = await _fileService.UploadFileAsync(
            file.OpenReadStream(),
            file.FileName,
            file.ContentType,
            file.Length,
            description,
            category,
            isPublic,
            cancellationToken);

        var dto = await _fileService.GetFileAsync(uploadedFile.Id, cancellationToken);
        return CreatedAtAction(nameof(GetFile), new { id = uploadedFile.Id }, dto);
    }

    /// <summary>Download a file by ID</summary>
    [HttpGet("{id:long}/download")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Download(long id, CancellationToken cancellationToken)
    {
        var fileData = await _fileService.GetFileStreamAsync(id, cancellationToken);
        if (fileData == null) return NotFound();

        return File(fileData.Value.Stream, fileData.Value.ContentType, fileData.Value.FileName);
    }

    /// <summary>Delete a file by ID</summary>
    [HttpDelete("{id:long}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken)
    {
        var deleted = await _fileService.DeleteFileAsync(id, cancellationToken);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
