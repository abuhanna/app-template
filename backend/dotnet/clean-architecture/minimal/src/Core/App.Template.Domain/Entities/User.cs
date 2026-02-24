namespace AppTemplate.Domain.Entities;

public class User : AuditableEntity
{
    public string Username { get; private set; } = null!;
    public string Email { get; private set; } = null!;
    public string PasswordHash { get; private set; } = null!;
    public string? Name { get; private set; }
    public string? Role { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime? LastLoginAt { get; private set; }
    public string? PasswordResetToken { get; private set; }
    public DateTime? PasswordResetTokenExpiry { get; private set; }
    public List<string> PasswordHistory { get; private set; } = new();

    private User() { }

    public User(string username, string email, string passwordHash, string? name = null, string? role = null)
    {
        Username = username;
        Email = email;
        PasswordHash = passwordHash;
        Name = name;
        Role = role ?? "User";
        IsActive = true;
        // CreatedAt and CreatedBy are set automatically by DbContext
    }

    public void Update(string? name, string? email, string? role)
    {
        if (email != null) Email = email;
        if (name != null) Name = name;
        if (role != null) Role = role;
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

    public void RecordLogin()
    {
        LastLoginAt = DateTime.UtcNow;
    }

    public void SetPasswordResetToken(string token, DateTime expiry)
    {
        PasswordResetToken = token;
        PasswordResetTokenExpiry = expiry;
        // UpdatedAt and UpdatedBy are set automatically by DbContext
    }

    public void ClearPasswordResetToken()
    {
        PasswordResetToken = null;
        PasswordResetTokenExpiry = null;
        // UpdatedAt and UpdatedBy are set automatically by DbContext
    }

    public bool IsPasswordResetTokenValid(string token)
    {
        return PasswordResetToken == token &&
               PasswordResetTokenExpiry.HasValue &&
               PasswordResetTokenExpiry.Value > DateTime.UtcNow;
    }
}
