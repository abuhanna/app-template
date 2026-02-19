using AppTemplate.Domain.Entities;

namespace AppTemplate.Domain.Tests.Entities;

public class UserTests
{
    [Fact]
    public void User_Constructor_ShouldSetProperties()
    {
        // Arrange & Act
        var user = new User(
            username: "testuser",
            email: "test@example.com",
            passwordHash: "hashedPassword",
            name: "Test User",
            role: "User",
            departmentId: 1);

        // Assert
        Assert.Equal("testuser", user.Username);
        Assert.Equal("test@example.com", user.Email);
        Assert.Equal("hashedPassword", user.PasswordHash);
        Assert.Equal("Test User", user.Name);
        Assert.Equal("User", user.Role);
        Assert.Equal(1, user.DepartmentId);
        Assert.True(user.IsActive);
        Assert.Null(user.LastLoginAt);
    }

    [Fact]
    public void User_Constructor_ShouldSetDefaultRole()
    {
        // Arrange & Act
        var user = new User(
            username: "testuser",
            email: "test@example.com",
            passwordHash: "hashedPassword");

        // Assert
        Assert.Equal("User", user.Role);
        Assert.Null(user.Name);
        Assert.Null(user.DepartmentId);
    }

    [Fact]
    public void Update_ShouldUpdateProperties()
    {
        // Arrange
        var user = new User("testuser", "test@example.com", "hash", "Old Name", "User", 1);

        // Act
        user.Update("New Name", "new@example.com", "Admin", 2);

        // Assert
        Assert.Equal("New Name", user.Name);
        Assert.Equal("new@example.com", user.Email);
        Assert.Equal("Admin", user.Role);
        Assert.Equal(2, user.DepartmentId);
        // Note: UpdatedAt is set by DbContext on SaveChanges, not by the entity method
    }

    [Fact]
    public void Update_ShouldAllowNullValues()
    {
        // Arrange
        var user = new User("testuser", "test@example.com", "hash", "Name", "User", 1);

        // Act - Update with nulls (should keep existing values for email/name/role)
        user.Update(null, null, null, null);

        // Assert - email, name, role should remain unchanged, departmentId becomes null
        Assert.Equal("Name", user.Name);
        Assert.Equal("test@example.com", user.Email);
        Assert.Equal("User", user.Role);
        Assert.Null(user.DepartmentId);
    }

    [Fact]
    public void UpdatePassword_ShouldUpdatePasswordHash()
    {
        // Arrange
        var user = new User("testuser", "test@example.com", "oldHash");

        // Act
        user.UpdatePassword("newHash");

        // Assert
        Assert.Equal("newHash", user.PasswordHash);
        // Note: UpdatedAt is set by DbContext on SaveChanges, not by the entity method
    }

    [Fact]
    public void SetActive_True_ShouldActivateUser()
    {
        // Arrange
        var user = new User("testuser", "test@example.com", "hash");
        user.SetActive(false);
        Assert.False(user.IsActive);

        // Act
        user.SetActive(true);

        // Assert
        Assert.True(user.IsActive);
    }

    [Fact]
    public void SetActive_False_ShouldDeactivateUser()
    {
        // Arrange
        var user = new User("testuser", "test@example.com", "hash");
        Assert.True(user.IsActive);

        // Act
        user.SetActive(false);

        // Assert
        Assert.False(user.IsActive);
    }

    [Fact]
    public void RecordLogin_ShouldSetLastLoginAt()
    {
        // Arrange
        var user = new User("testuser", "test@example.com", "hash");
        Assert.Null(user.LastLoginAt);

        // Act
        user.RecordLogin();

        // Assert
        Assert.NotNull(user.LastLoginAt);
        Assert.True(user.LastLoginAt <= DateTime.UtcNow);
        Assert.True(user.LastLoginAt >= DateTime.UtcNow.AddSeconds(-1));
    }

    [Fact]
    public void SetPasswordResetToken_ShouldSetTokenAndExpiry()
    {
        // Arrange
        var user = new User("testuser", "test@example.com", "hash");
        var token = "reset-token-123";
        var expiry = DateTime.UtcNow.AddHours(1);

        // Act
        user.SetPasswordResetToken(token, expiry);

        // Assert
        Assert.Equal(token, user.PasswordResetToken);
        Assert.Equal(expiry, user.PasswordResetTokenExpiry);
    }

    [Fact]
    public void ClearPasswordResetToken_ShouldClearTokenAndExpiry()
    {
        // Arrange
        var user = new User("testuser", "test@example.com", "hash");
        user.SetPasswordResetToken("token", DateTime.UtcNow.AddHours(1));

        // Act
        user.ClearPasswordResetToken();

        // Assert
        Assert.Null(user.PasswordResetToken);
        Assert.Null(user.PasswordResetTokenExpiry);
    }

    [Fact]
    public void IsPasswordResetTokenValid_ShouldReturnTrue_WhenTokenMatchesAndNotExpired()
    {
        // Arrange
        var user = new User("testuser", "test@example.com", "hash");
        var token = "valid-token";
        user.SetPasswordResetToken(token, DateTime.UtcNow.AddHours(1));

        // Act
        var result = user.IsPasswordResetTokenValid(token);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void IsPasswordResetTokenValid_ShouldReturnFalse_WhenTokenDoesNotMatch()
    {
        // Arrange
        var user = new User("testuser", "test@example.com", "hash");
        user.SetPasswordResetToken("correct-token", DateTime.UtcNow.AddHours(1));

        // Act
        var result = user.IsPasswordResetTokenValid("wrong-token");

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void IsPasswordResetTokenValid_ShouldReturnFalse_WhenTokenExpired()
    {
        // Arrange
        var user = new User("testuser", "test@example.com", "hash");
        user.SetPasswordResetToken("token", DateTime.UtcNow.AddHours(-1)); // Expired

        // Act
        var result = user.IsPasswordResetTokenValid("token");

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void IsPasswordResetTokenValid_ShouldReturnFalse_WhenNoTokenSet()
    {
        // Arrange
        var user = new User("testuser", "test@example.com", "hash");

        // Act
        var result = user.IsPasswordResetTokenValid("any-token");

        // Assert
        Assert.False(result);
    }
}
