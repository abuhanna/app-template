using App.Template.Api.Common.Entities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace App.Template.Api.Features.Users;

/// <summary>
/// User entity - belongs to the Users feature module
/// </summary>
[Table("Users")]
public class User : AuditableEntity
{
    [Key]
    public int Id { get; set; }

    [Column(nullable: false, TypeName = "nvarchar(100)")]
    public string Name { get; set; } = string.Empty;

    [Column(nullable: false, TypeName = "nvarchar(255)")]
    public string Email { get; set; } = string.Empty;

    [Column(name: "password_hash")]
    public string? PasswordHash { get; set; }

    [Column(name: "is_active")]
    public bool IsActive { get; set; } = true;
}
