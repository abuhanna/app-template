using App.Template.Api.Common.Entities;
using App.Template.Api.Features.Users;

namespace App.Template.Api.Features.Departments;

public class Department : AuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<User> Users { get; set; } = new List<User>();
}
