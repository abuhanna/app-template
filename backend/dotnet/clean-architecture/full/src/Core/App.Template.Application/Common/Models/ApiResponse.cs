namespace AppTemplate.Application.Common.Models;

public class ApiResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string>? Errors { get; set; }

    public static ApiResponse Ok(string message = "Operation successful")
        => new() { Success = true, Message = message };

    public static ApiResponse<T> Ok<T>(T data, string message = "Operation successful")
        => new() { Success = true, Message = message, Data = data };

    public static ApiResponse Fail(string message, List<string>? errors = null)
        => new() { Success = false, Message = message, Errors = errors };
}

public class ApiResponse<T> : ApiResponse
{
    public T? Data { get; set; }

    public static ApiResponse<T> Ok(T data, string message = "Operation successful")
        => new() { Success = true, Message = message, Data = data };

    public static new ApiResponse<T> Fail(string message, List<string>? errors = null)
        => new() { Success = false, Message = message, Errors = errors };
}

public class PaginatedResponse<T> : ApiResponse<List<T>>
{
    public PaginationInfo? Pagination { get; set; }

    public static PaginatedResponse<T> From(PagedResult<T> result, string message = "Items retrieved successfully")
        => new()
        {
            Success = true,
            Message = message,
            Data = result.Items,
            Pagination = new PaginationInfo
            {
                Page = result.Pagination.Page,
                PageSize = result.Pagination.PageSize,
                TotalItems = result.Pagination.TotalItems,
                TotalPages = result.Pagination.TotalPages,
                HasNext = result.Pagination.HasNext,
                HasPrevious = result.Pagination.HasPrevious
            }
        };
}

public class PaginationInfo
{
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
    public bool HasNext { get; set; }
    public bool HasPrevious { get; set; }
}
