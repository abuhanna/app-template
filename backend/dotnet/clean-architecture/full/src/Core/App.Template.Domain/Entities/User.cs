namespace AppTemplate.Domain.Entities;

public class User : AuditableEntity
{
    public string Username { get; private set; } = null!;
    public string Email { get; private set; } = null!;
    public string PasswordHash { get; private set; } = null!;
    public string? FirstName { get; private set; }
    public string? LastName { get; private set; }
    public string? Role { get; private set; }
    public long? DepartmentId { get; private set; }
    public Department? Department { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime? LastLoginAt { get; private set; }
    public string? LastLoginIp { get; private set; }
    public string? PasswordResetToken { get; private set; }
    public DateTime? PasswordResetTokenExpiresAt { get; private set; }
    public List<string> PasswordHistory { get; private set; } = new();

    private User() { }

    public User(string username, string email, string passwordHash, string? firstName = null, string? lastName = null, string? role = null, long? departmentId = null)
    {
        Username = username;
        Email = email;
        PasswordHash = passwordHash;
        FirstName = firstName;
        LastName = lastName;
        Role = role ?? "user";
        DepartmentId = departmentId;
        IsActive = true;
        // CreatedAt and CreatedBy are set automatically by DbContext
    }

    public void Update(string? firstName, string? lastName, string? email, string? role, long? departmentId)
    {
        if (email != null) Email = email;
        if (firstName != null) FirstName = firstName;
        if (lastName != null) LastName = lastName;
        if (role != null) Role = role;
        DepartmentId = departmentId;
        // UpdatedAt and UpdatedBy are set automatically by DbContext
    }

    public void UpdatePassword(string passwordHash)
    {
        // Add current password to history before updating
        if (!string.IsNullOrEmpty(PasswordHash))
        {
            PasswordHistory.Add(PasswordHash);
            // Keep only last 5 passwords in history
            if (PasswordHistory.Count > 5)
            {
                PasswordHistory.RemoveAt(0);
            }
        }
        PasswordHash = passwordHash;
        // UpdatedAt and UpdatedBy are set automatically by DbContext
    }

    public bool IsPasswordInHistory(string passwordHash)
    {
        return PasswordHistory.Contains(passwordHash);
    }

    public void SetActive(bool isActive)
    {
        IsActive = isActive;
        // UpdatedAt and UpdatedBy are set automatically by DbContext
    }

    public void RecordLogin(string? ipAddress = null)
    {
        LastLoginAt = DateTime.UtcNow;
        if (ipAddress != null) LastLoginIp = ipAddress;
    }

    public void SetPasswordResetToken(string token, DateTime expiry)
    {
        PasswordResetToken = token;
        PasswordResetTokenExpiresAt = expiry;
        // UpdatedAt and UpdatedBy are set automatically by DbContext
    }

    public void ClearPasswordResetToken()
    {
        PasswordResetToken = null;
        PasswordResetTokenExpiresAt = null;
        // UpdatedAt and UpdatedBy are set automatically by DbContext
    }

    public bool IsPasswordResetTokenValid(string token)
    {
        return PasswordResetToken == token &&
               PasswordResetTokenExpiresAt.HasValue &&
               PasswordResetTokenExpiresAt.Value > DateTime.UtcNow;
    }
}
