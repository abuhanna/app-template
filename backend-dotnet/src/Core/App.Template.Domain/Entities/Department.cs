namespace AppTemplate.Domain.Entities;

public class Department : AuditableEntity
{
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation
    public IReadOnlyCollection<User> Users => _users.AsReadOnly();
    private readonly List<User> _users = new();

    private Department() { }

    public Department(string code, string name, string? description = null)
    {
        Code = code;
        Name = name;
        Description = description;
        IsActive = true;
        // CreatedAt and CreatedBy are set automatically by DbContext
    }

    public void Update(string name, string? description)
    {
        Name = name;
        Description = description;
        // UpdatedAt and UpdatedBy are set automatically by DbContext
    }

    public void UpdateCode(string code)
    {
        Code = code;
        // UpdatedAt and UpdatedBy are set automatically by DbContext
    }

    public void SetActive(bool isActive)
    {
        IsActive = isActive;
        // UpdatedAt and UpdatedBy are set automatically by DbContext
    }
}
