using System.Linq.Expressions;
using System.Reflection;

namespace AppTemplate.Application.Common.Extensions;

public static class QueryableExtensions
{
    public static IQueryable<T> ApplySort<T>(
        this IQueryable<T> query,
        string? sortBy,
        string? sortDir = "asc")
    {
        if (string.IsNullOrWhiteSpace(sortBy))
            return query;

        var entityType = typeof(T);
        var property = entityType.GetProperty(
            sortBy,
            BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);

        if (property == null)
            return query;

        var parameter = Expression.Parameter(entityType, "x");
        var propertyAccess = Expression.Property(parameter, property);
        var orderByExpression = Expression.Lambda(propertyAccess, parameter);

        var isDescending = sortDir?.Equals("desc", StringComparison.OrdinalIgnoreCase) ?? false;
        var methodName = isDescending ? "OrderByDescending" : "OrderBy";

        var resultExpression = Expression.Call(
            typeof(Queryable),
            methodName,
            new[] { entityType, property.PropertyType },
            query.Expression,
            Expression.Quote(orderByExpression));

        return query.Provider.CreateQuery<T>(resultExpression);
    }

    public static IQueryable<T> ApplySearch<T>(
        this IQueryable<T> query,
        string? search,
        params Expression<Func<T, string?>>[] propertySelectors)
    {
        if (string.IsNullOrWhiteSpace(search) || propertySelectors.Length == 0)
            return query;

        var parameter = Expression.Parameter(typeof(T), "x");
        var searchLower = search.ToLower();
        var searchConstant = Expression.Constant(searchLower);

        Expression? combinedCondition = null;

        foreach (var selector in propertySelectors)
        {
            var propertyAccess = ReplaceParameter(selector.Body, selector.Parameters[0], parameter);

            // Build: property != null && property.ToLower().Contains(search)
            var nullCheck = Expression.NotEqual(propertyAccess, Expression.Constant(null, typeof(string)));
            var toLowerCall = Expression.Call(propertyAccess, typeof(string).GetMethod("ToLower", Type.EmptyTypes)!);
            var containsCall = Expression.Call(toLowerCall, typeof(string).GetMethod("Contains", new[] { typeof(string) })!, searchConstant);
            var condition = Expression.AndAlso(nullCheck, containsCall);

            combinedCondition = combinedCondition == null
                ? condition
                : Expression.OrElse(combinedCondition, condition);
        }

        if (combinedCondition == null)
            return query;

        var lambda = Expression.Lambda<Func<T, bool>>(combinedCondition, parameter);
        return query.Where(lambda);
    }

    private static Expression ReplaceParameter(Expression expression, ParameterExpression oldParameter, ParameterExpression newParameter)
    {
        return new ParameterReplacer(oldParameter, newParameter).Visit(expression);
    }

    private class ParameterReplacer : ExpressionVisitor
    {
        private readonly ParameterExpression _oldParameter;
        private readonly ParameterExpression _newParameter;

        public ParameterReplacer(ParameterExpression oldParameter, ParameterExpression newParameter)
        {
            _oldParameter = oldParameter;
            _newParameter = newParameter;
        }

        protected override Expression VisitParameter(ParameterExpression node)
        {
            return node == _oldParameter ? _newParameter : base.VisitParameter(node);
        }
    }
}
