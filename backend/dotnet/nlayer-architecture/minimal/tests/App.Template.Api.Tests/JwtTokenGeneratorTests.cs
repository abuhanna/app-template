using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using App.Template.Api.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Moq;
using Xunit;

namespace App.Template.Api.Tests;

public class JwtTokenGeneratorTests
{
    private const string TestSecret = "ThisIsATestSecretKeyThatIsLongEnoughForHS256Algorithm!";
    private const string TestIssuer = "TestIssuer";
    private const string TestAudience = "TestAudience";

    private static IConfiguration CreateTestConfiguration(
        string? secret = TestSecret,
        string? issuer = TestIssuer,
        string? audience = TestAudience)
    {
        var configData = new Dictionary<string, string?>();

        if (secret != null)
            configData["Jwt:Secret"] = secret;
        if (issuer != null)
            configData["Jwt:Issuer"] = issuer;
        if (audience != null)
            configData["Jwt:Audience"] = audience;

        return new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();
    }

    private static string GenerateTestToken(
        string userId = "123",
        string username = "testuser",
        string secret = TestSecret,
        DateTime? expires = null)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Name, username)
        };

        var token = new JwtSecurityToken(
            issuer: TestIssuer,
            audience: TestAudience,
            claims: claims,
            expires: expires ?? DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    [Fact]
    public void Constructor_WithValidConfiguration_CreatesInstance()
    {
        // Arrange
        var configuration = CreateTestConfiguration();

        // Act
        var generator = new JwtTokenGenerator(configuration);

        // Assert
        Assert.NotNull(generator);
    }

    [Fact]
    public void Constructor_WithMissingSecret_ThrowsInvalidOperationException()
    {
        // Arrange
        var configuration = CreateTestConfiguration(secret: null);

        // Act & Assert
        Assert.Throws<InvalidOperationException>(() => new JwtTokenGenerator(configuration));
    }

    [Fact]
    public void Constructor_WithMissingIssuer_UsesDefaultIssuer()
    {
        // Arrange - no Jwt:Issuer key, should default to "AppTemplate"
        var configuration = CreateTestConfiguration(issuer: null);

        // Act
        var generator = new JwtTokenGenerator(configuration);

        // Assert - instance created successfully with default issuer
        Assert.NotNull(generator);
    }

    [Fact]
    public void Constructor_WithMissingAudience_UsesDefaultAudience()
    {
        // Arrange - no Jwt:Audience key, should default to "AppTemplate"
        var configuration = CreateTestConfiguration(audience: null);

        // Act
        var generator = new JwtTokenGenerator(configuration);

        // Assert - instance created successfully with default audience
        Assert.NotNull(generator);
    }

    [Fact]
    public void ValidateToken_WithValidToken_ReturnsUserIdAndUsername()
    {
        // Arrange
        var configuration = CreateTestConfiguration();
        var generator = new JwtTokenGenerator(configuration);
        var token = GenerateTestToken(userId: "42", username: "admin");

        // Act
        var (userId, username) = generator.ValidateToken(token);

        // Assert
        Assert.Equal("42", userId);
        Assert.Equal("admin", username);
    }

    [Fact]
    public void ValidateToken_WithInvalidToken_ReturnsNulls()
    {
        // Arrange
        var configuration = CreateTestConfiguration();
        var generator = new JwtTokenGenerator(configuration);

        // Act
        var (userId, username) = generator.ValidateToken("invalid-token-string");

        // Assert
        Assert.Null(userId);
        Assert.Null(username);
    }

    [Fact]
    public void ValidateToken_WithExpiredToken_ReturnsNulls()
    {
        // Arrange
        var configuration = CreateTestConfiguration();
        var generator = new JwtTokenGenerator(configuration);
        var token = GenerateTestToken(expires: DateTime.UtcNow.AddHours(-1));

        // Act
        var (userId, username) = generator.ValidateToken(token);

        // Assert
        Assert.Null(userId);
        Assert.Null(username);
    }

    [Fact]
    public void ValidateToken_WithWrongSigningKey_ReturnsNulls()
    {
        // Arrange
        var configuration = CreateTestConfiguration();
        var generator = new JwtTokenGenerator(configuration);
        var token = GenerateTestToken(secret: "ADifferentSecretKeyThatIsAlsoLongEnoughForHS256Algorithm!");

        // Act
        var (userId, username) = generator.ValidateToken(token);

        // Assert
        Assert.Null(userId);
        Assert.Null(username);
    }

    [Fact]
    public void ResolveSigningKey_WithPlainUtf8String_ReturnsSymmetricSecurityKey()
    {
        // Arrange
        var plainSecret = "MyPlainTextSecretKey";

        // Act
        var key = JwtTokenGenerator.ResolveSigningKey(plainSecret);

        // Assert
        Assert.NotNull(key);
        Assert.Equal(Encoding.UTF8.GetBytes(plainSecret).Length, key.Key.Length);
    }

    [Fact]
    public void ResolveSigningKey_WithValidBase64String_ReturnsSymmetricSecurityKey()
    {
        // Arrange - create a valid Base64-encoded key of at least 16 bytes (128 bits)
        var rawBytes = new byte[32];
        Random.Shared.NextBytes(rawBytes);
        var base64Secret = Convert.ToBase64String(rawBytes);

        // Act
        var key = JwtTokenGenerator.ResolveSigningKey(base64Secret);

        // Assert
        Assert.NotNull(key);
        Assert.Equal(32, key.Key.Length);
    }

    [Fact]
    public void ResolveSigningKey_WithShortBase64String_FallsBackToUtf8()
    {
        // Arrange - Base64 that decodes to less than 16 bytes
        var shortBytes = new byte[8];
        var base64Secret = Convert.ToBase64String(shortBytes);

        // Act
        var key = JwtTokenGenerator.ResolveSigningKey(base64Secret);

        // Assert
        Assert.NotNull(key);
        // Falls back to UTF-8 encoding of the Base64 string itself
        Assert.Equal(Encoding.UTF8.GetBytes(base64Secret).Length, key.Key.Length);
    }
}
