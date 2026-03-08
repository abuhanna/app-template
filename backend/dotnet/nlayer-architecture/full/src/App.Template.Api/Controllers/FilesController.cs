using App.Template.Api.Models.Common;
using App.Template.Api.Models.Dtos;
using App.Template.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Template.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/files")]
public class FilesController : ControllerBase
{
    private readonly IFileService _fileService;

    public FilesController(IFileService fileService)
    {
        _fileService = fileService;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<UploadedFileDto>>> GetAll([FromQuery] FilesQueryParams queryParams)
    {
        var result = await _fileService.GetFilesAsync(queryParams);
        return Ok(PaginatedResponse<UploadedFileDto>.From(result, "Files retrieved successfully"));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<UploadedFileDto>>> GetMetadata(long id)
    {
        var metadata = await _fileService.GetMetadataAsync(id);
        if (metadata == null) return NotFound(ApiResponse.Fail("File not found"));
        return Ok(ApiResponse.Ok(metadata, "File retrieved successfully"));
    }

    [HttpPost]
    [RequestSizeLimit(52428800)]
    public async Task<ActionResult<ApiResponse<UploadedFileDto>>> Upload(
        IFormFile file,
        [FromForm] string? description = null,
        [FromForm] string? category = null,
        [FromForm] bool isPublic = false)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse.Fail("No file provided or file is empty"));

        var result = await _fileService.UploadAsync(file, description, category, isPublic);
        return StatusCode(201, ApiResponse.Ok(result, "File uploaded successfully"));
    }

    [AllowAnonymous]
    [HttpGet("{id}/download")]
    public async Task<IActionResult> Download(long id)
    {
        var fileData = await _fileService.DownloadAsync(id);
        if (fileData == null) return NotFound(ApiResponse.Fail("File not found"));
        return File(fileData.Value.Stream, fileData.Value.ContentType, fileData.Value.FileName);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(long id)
    {
        var deleted = await _fileService.DeleteAsync(id);
        if (!deleted) return NotFound(ApiResponse.Fail("File not found"));
        return NoContent();
    }
}
