using AppTemplate.Application.DTOs;
using AppTemplate.Application.Features.FileManagement.Commands.DeleteFile;
using AppTemplate.Application.Features.FileManagement.Commands.UploadFile;
using AppTemplate.Application.Features.FileManagement.Queries.DownloadFile;
using AppTemplate.Application.Features.FileManagement.Queries.GetFile;
using AppTemplate.Application.Features.FileManagement.Queries.GetFiles;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppTemplate.WebAPI.Controllers;

/// <summary>
/// File management endpoints
/// </summary>
[Authorize]
[ApiController]
[Route("api/files")]
public class FilesController : ControllerBase
{
    private readonly ISender _mediator;
    private readonly ILogger<FilesController> _logger;

    public FilesController(ISender mediator, ILogger<FilesController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get list of uploaded files
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<UploadedFileDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFiles(
        [FromQuery] string? category,
        [FromQuery] bool? isPublic,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetFilesQuery
        {
            Category = category,
            IsPublic = isPublic,
            Page = page,
            PageSize = pageSize
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get file metadata by ID
    /// </summary>
    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(UploadedFileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetFile(long id)
    {
        var query = new GetFileQuery(id);
        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound(new { message = $"File with ID {id} not found" });
        }

        return Ok(result);
    }

    /// <summary>
    /// Upload a new file
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(UploadedFileDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [RequestSizeLimit(50 * 1024 * 1024)] // 50MB limit
    public async Task<IActionResult> UploadFile(
        IFormFile file,
        [FromForm] string? description,
        [FromForm] string? category,
        [FromForm] bool isPublic = false)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded" });
        }

        _logger.LogInformation("Uploading file: {FileName}, Size: {Size}", file.FileName, file.Length);

        await using var stream = file.OpenReadStream();
        var command = new UploadFileCommand
        {
            FileStream = stream,
            FileName = file.FileName,
            ContentType = file.ContentType,
            FileSize = file.Length,
            Description = description,
            Category = category,
            IsPublic = isPublic
        };

        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetFile), new { id = result.Id }, result);
    }

    /// <summary>
    /// Download a file
    /// </summary>
    [HttpGet("{id:long}/download")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [AllowAnonymous] // Allow public file downloads
    public async Task<IActionResult> DownloadFile(long id)
    {
        var query = new DownloadFileQuery(id);
        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound(new { message = $"File with ID {id} not found" });
        }

        return File(result.FileStream, result.ContentType, result.FileName);
    }

    /// <summary>
    /// Delete a file
    /// </summary>
    [HttpDelete("{id:long}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteFile(long id)
    {
        var command = new DeleteFileCommand(id);
        var result = await _mediator.Send(command);

        if (!result)
        {
            return NotFound(new { message = $"File with ID {id} not found" });
        }

        return NoContent();
    }
}
