using System.Net.Http.Json;
using AppTemplate.Application.DTOs;
using AppTemplate.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace AppTemplate.Infrastructure.Services;

/// <summary>
/// Service for resolving organization structure from external SSO API
/// </summary>
public class OrganizationService : IOrganizationService
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly string? _ssoApiBaseUrl;
    private readonly ILogger<OrganizationService> _logger;

    public OrganizationService(
        HttpClient httpClient,
        IMemoryCache cache,
        IConfiguration configuration,
        ILogger<OrganizationService> logger)
    {
        _httpClient = httpClient;
        _cache = cache;
        _logger = logger;
        _ssoApiBaseUrl = configuration["Sso:BaseUrl"];
    }

    /// <summary>
    /// Extract JWT token from Authorization header (remove "Bearer " prefix)
    /// </summary>
    private static string? ExtractToken(string? authorizationHeader)
    {
        if (string.IsNullOrEmpty(authorizationHeader))
            return null;

        const string bearerPrefix = "Bearer ";
        if (authorizationHeader.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
        {
            return authorizationHeader.Substring(bearerPrefix.Length).Trim();
        }

        return authorizationHeader.Trim();
    }

    /// <summary>
    /// Get list of departments from SSO
    /// </summary>
    public async Task<List<DepartmentDto>> GetDepartmentsAsync(string? authorizationHeader, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(_ssoApiBaseUrl))
        {
            _logger.LogWarning("SSO is not configured, returning empty department list");
            return new List<DepartmentDto>();
        }

        try
        {
            _logger.LogInformation("Fetching departments from SSO API: {BaseUrl}/departments", _ssoApiBaseUrl);

            var token = ExtractToken(authorizationHeader);
            var request = new HttpRequestMessage(HttpMethod.Get, $"{_ssoApiBaseUrl}/departments");

            if (!string.IsNullOrEmpty(token))
            {
                request.Headers.Add("Authorization", token);
            }

            var response = await _httpClient.SendAsync(request, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("Failed to fetch departments from SSO. Status: {StatusCode}, Error: {Error}",
                    response.StatusCode, errorContent);
                return new List<DepartmentDto>();
            }

            var departments = await response.Content.ReadFromJsonAsync<List<DepartmentDto>>(cancellationToken: cancellationToken)
                ?? new List<DepartmentDto>();

            _logger.LogInformation("Successfully fetched {Count} departments from SSO", departments.Count);

            return departments;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Failed to connect to SSO API at {BaseUrl}", _ssoApiBaseUrl);
            return new List<DepartmentDto>();
        }
    }

    /// <summary>
    /// Get list of users from SSO with caching
    /// </summary>
    public async Task<List<UserDto>> GetUsersAsync(string? authorizationHeader, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(_ssoApiBaseUrl))
        {
            _logger.LogWarning("SSO is not configured, returning empty user list");
            return new List<UserDto>();
        }

        const string cacheKey = "SSO_ALL_USERS";

        if (_cache.TryGetValue(cacheKey, out List<UserDto>? cachedUsers) && cachedUsers != null)
        {
            _logger.LogInformation("Returning {Count} users from cache", cachedUsers.Count);
            return cachedUsers;
        }

        try
        {
            _logger.LogInformation("Fetching users from SSO API: {BaseUrl}/users", _ssoApiBaseUrl);

            var token = ExtractToken(authorizationHeader);
            var request = new HttpRequestMessage(HttpMethod.Get, $"{_ssoApiBaseUrl}/users/view");

            if (!string.IsNullOrEmpty(token))
            {
                request.Headers.Add("Authorization", token);
            }

            var response = await _httpClient.SendAsync(request, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("Failed to fetch users from SSO. Status: {StatusCode}, Error: {Error}",
                    response.StatusCode, errorContent);
                return new List<UserDto>();
            }

            var users = await response.Content.ReadFromJsonAsync<List<UserDto>>(cancellationToken: cancellationToken)
                ?? new List<UserDto>();

            _logger.LogInformation("Successfully fetched {Count} users from SSO", users.Count);

            var cacheEntryOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(15));

            _cache.Set(cacheKey, users, cacheEntryOptions);

            return users;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Failed to connect to SSO API at {BaseUrl}", _ssoApiBaseUrl);
            return new List<UserDto>();
        }
    }
}
