using System.ComponentModel.DataAnnotations;

namespace App.Template.Api.Models.Dtos;

public record DepartmentDto(int Id, string Name, string Code, string? Description);

public class CreateDepartmentDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Code { get; set; } = string.Empty;

    public string? Description { get; set; }
}

public class UpdateDepartmentDto
{
    public string? Name { get; set; }
    public string? Code { get; set; }
    public string? Description { get; set; }
}
