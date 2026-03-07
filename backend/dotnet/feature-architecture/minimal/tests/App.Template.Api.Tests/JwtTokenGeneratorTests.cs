using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using App.Template.Api.Common.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Xunit;

namespace App.Template.Api.Tests;

public class JwtTokenGeneratorTests
{
    private const string TestSecret = "ThisIsATestSecretKeyThatIsLongEnoughForHmacSha256";
    private const string TestIssuer = "TestIssuer";
    private const string TestAudience = "TestAudience";

    private readonly JwtTokenGenerator _tokenGenerator;

    public JwtTokenGeneratorTests()
    {
        var configData = new Dictionary<string, string?>
        {
            { "Jwt:Secret", TestSecret },
            { "Jwt:Issuer", TestIssuer },
            { "Jwt:Audience", TestAudience }
        };
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();

        _tokenGenerator = new JwtTokenGenerator(configuration);
    }

    [Fact]
    public void Constructor_ThrowsInvalidOperationException_WhenSecretNotConfigured()
    {
        // Arrange
        var configData = new Dictionary<string, string?>();
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();

        // Act & Assert
        Assert.Throws<InvalidOperationException>(() => new JwtTokenGenerator(configuration));
    }

    [Fact]
    public void ValidateToken_WithValidToken_ReturnsUserIdAndUsername()
    {
        // Arrange
        var signingKey = JwtTokenGenerator.ResolveSigningKey(TestSecret);
        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "42"),
                new Claim(ClaimTypes.Name, "testuser")
            }),
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        // Act
        var (userId, username) = _tokenGenerator.ValidateToken(tokenString);

        // Assert
        Assert.Equal("42", userId);
        Assert.Equal("testuser", username);
    }

    [Fact]
    public void ValidateToken_WithInvalidToken_ReturnsNulls()
    {
        // Arrange
        var invalidToken = "this.is.not.a.valid.jwt.token";

        // Act
        var (userId, username) = _tokenGenerator.ValidateToken(invalidToken);

        // Assert
        Assert.Null(userId);
        Assert.Null(username);
    }

    [Fact]
    public void ValidateToken_WithExpiredToken_ReturnsNulls()
    {
        // Arrange
        var signingKey = JwtTokenGenerator.ResolveSigningKey(TestSecret);
        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "42"),
                new Claim(ClaimTypes.Name, "testuser")
            }),
            NotBefore = DateTime.UtcNow.AddHours(-2), // Issued 2 hours ago
            Expires = DateTime.UtcNow.AddHours(-1),   // Expired 1 hour ago
            SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        // Act
        var (userId, username) = _tokenGenerator.ValidateToken(tokenString);

        // Assert
        Assert.Null(userId);
        Assert.Null(username);
    }

    [Fact]
    public void ResolveSigningKey_WithPlainString_ReturnsUtf8Key()
    {
        // Arrange
        var plainSecret = "my-plain-text-secret-key";

        // Act
        var key = JwtTokenGenerator.ResolveSigningKey(plainSecret);

        // Assert
        Assert.NotNull(key);
        Assert.Equal(Encoding.UTF8.GetBytes(plainSecret), key.Key);
    }

    [Fact]
    public void ResolveSigningKey_WithBase64String_ReturnsDecodedKey()
    {
        // Arrange — create a Base64 string from 32 bytes (256-bit key)
        var rawBytes = new byte[32];
        new Random(42).NextBytes(rawBytes);
        var base64Secret = Convert.ToBase64String(rawBytes);

        // Act
        var key = JwtTokenGenerator.ResolveSigningKey(base64Secret);

        // Assert
        Assert.NotNull(key);
        Assert.Equal(rawBytes, key.Key);
    }
}
