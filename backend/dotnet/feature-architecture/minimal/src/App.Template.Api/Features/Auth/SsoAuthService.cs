using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Text;
using System.Text.Json;

using App.Template.Api.Features.Auth.Dtos;

namespace App.Template.Api.Features.Auth;

public interface ISsoAuthService
{
    Task<LoginResponseDto> LoginAsync(string username, string password, CancellationToken cancellationToken = default);
    Task<bool> LogoutAsync(string? authorizationHeader, CancellationToken cancellationToken = default);
}

public class SsoAuthService : ISsoAuthService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SsoAuthService> _logger;

    public SsoAuthService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<SsoAuthService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<LoginResponseDto> LoginAsync(string username, string password, CancellationToken cancellationToken = default)
    {
        var ssoBaseUrl = _configuration["Sso:BaseUrl"]
            ?? throw new InvalidOperationException("SSO BaseUrl not configured");
        var loginPath = _configuration["Sso:LoginPath"] ?? "/login";
        var ssoLoginUrl = $"{ssoBaseUrl}{loginPath}";

        _logger.LogInformation("Sending login request to SSO: {SsoUrl}", ssoLoginUrl);

        var httpClient = _httpClientFactory.CreateClient();
        httpClient.Timeout = TimeSpan.FromSeconds(30);

        var loginRequest = new { username, password };
        var jsonContent = JsonSerializer.Serialize(loginRequest);
        var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");

        HttpResponseMessage response;
        try
        {
            response = await httpClient.PostAsync(ssoLoginUrl, httpContent, cancellationToken);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Failed to connect to SSO service");
            throw new InvalidOperationException("Authentication service is currently unavailable", ex);
        }

        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            if (response.StatusCode == HttpStatusCode.Unauthorized)
            {
                _logger.LogWarning("Login failed - Invalid credentials for user: {Username}", username);
                throw new UnauthorizedAccessException("Invalid username or password");
            }

            _logger.LogError("SSO service returned error: {StatusCode}, Content: {Content}",
                response.StatusCode, responseContent);
            throw new InvalidOperationException($"Authentication service error: {response.StatusCode}");
        }

        try
        {
            var tokenString = responseContent;
            var handler = new JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(tokenString);

            var expiresAt = token.ValidTo;
            var expiresIn = (int)(expiresAt.ToUniversalTime() - DateTime.UtcNow).TotalSeconds;

            string? GetClaim(string type) => token.Claims.FirstOrDefault(c => c.Type == type)?.Value;
            var roleClaim = GetClaim("role");

            return new LoginResponseDto
            {
                Token = tokenString,
                ExpiresIn = expiresIn,
                User = new UserInfoDto
                {
                    Id = GetClaim("jti") ?? GetClaim("sub"),
                    Username = GetClaim("username") ?? username,
                    Email = GetClaim("email"),
                    Role = string.IsNullOrWhiteSpace(roleClaim) ? "User" : roleClaim,
                    Name = GetClaim("name") ?? GetClaim("sub"),
                    DepartmentId = GetClaim("departmentId"),
                    DepartmentName = GetClaim("department")
                }
            };
        }
        catch (ArgumentException ex)
        {
            _logger.LogError(ex, "Failed to parse SSO login response JWT: {Content}", responseContent);
            throw new InvalidOperationException("Invalid JWT response from authentication service", ex);
        }
    }

    public async Task<bool> LogoutAsync(string? authorizationHeader, CancellationToken cancellationToken = default)
    {
        var ssoBaseUrl = _configuration["Sso:BaseUrl"]
            ?? throw new InvalidOperationException("SSO BaseUrl not configured");
        var logoutPath = _configuration["Sso:LogoutPath"] ?? "/logout";
        var ssoLogoutUrl = $"{ssoBaseUrl}{logoutPath}";

        _logger.LogInformation("Sending logout request to SSO: {SsoUrl}", ssoLogoutUrl);

        var httpClient = _httpClientFactory.CreateClient();
        httpClient.Timeout = TimeSpan.FromSeconds(30);

        if (!string.IsNullOrEmpty(authorizationHeader))
        {
            httpClient.DefaultRequestHeaders.Add("Authorization", authorizationHeader);
        }

        try
        {
            var response = await httpClient.PostAsync(ssoLogoutUrl, null, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("SSO service returned error during logout: {StatusCode}, Content: {Content}",
                    response.StatusCode, responseContent);
            }

            // Return success regardless - token will expire naturally
            return true;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "Failed to connect to SSO service for logout - token will expire naturally");
            return true;
        }
    }
}
