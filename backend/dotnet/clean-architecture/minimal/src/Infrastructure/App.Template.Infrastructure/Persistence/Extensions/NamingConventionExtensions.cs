using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace AppTemplate.Infrastructure.Persistence.Extensions;

public static class NamingConventionExtensions
{
    /// <summary>
    /// Configures EF Core to use snake_case naming convention for tables and columns
    /// Standards:
    /// 1. English vocabulary only
    /// 2. All lowercase
    /// 3. Snake_case (underscores between words)
    /// 4. Plural table names, singular foreign keys
    /// </summary>
    public static void UseSnakeCaseNamingConvention(this ModelBuilder modelBuilder)
    {
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            // Table names: plural, snake_case, lowercase
            // Use ClrType.Name to ensure we start from singular form
            var singularName = entity.ClrType.Name;
            var pluralName = Pluralize(singularName);
            var tableName = ToSnakeCase(pluralName);
            entity.SetTableName(tableName);

            // Column names: snake_case, lowercase
            foreach (var property in entity.GetProperties())
            {
                var columnName = ToSnakeCase(property.Name);
                property.SetColumnName(columnName);
            }

            // Primary key constraint names
            foreach (var key in entity.GetKeys())
            {
                var keyName = $"pk_{tableName}";
                key.SetName(keyName);
            }

            // Foreign key constraint names
            foreach (var foreignKey in entity.GetForeignKeys())
            {
                var principalName = foreignKey.PrincipalEntityType.ClrType.Name;
                var principalPlural = Pluralize(principalName);
                var principalTable = ToSnakeCase(principalPlural);
                var fkName = $"fk_{tableName}_{principalTable}";
                foreignKey.SetConstraintName(fkName);
            }

            // Index names
            foreach (var index in entity.GetIndexes())
            {
                var indexName = $"ix_{tableName}_{string.Join("_", index.Properties.Select(p => ToSnakeCase(p.Name)))}";
                index.SetDatabaseName(indexName);
            }
        }
    }

    /// <summary>
    /// Converts PascalCase to snake_case
    /// Example: ProcessInstance -> process_instance
    /// </summary>
    private static string ToSnakeCase(string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        // Insert underscore before uppercase letters (except the first character)
        var snakeCase = Regex.Replace(input, "(?<!^)([A-Z])", "_$1");

        return snakeCase.ToLowerInvariant();
    }

    /// <summary>
    /// Simple pluralization for common English words
    /// For complex pluralization, consider using Humanizer library
    /// </summary>
    private static string Pluralize(string word)
    {
        if (string.IsNullOrEmpty(word))
            return word;

        // Already plural - don't pluralize again
        if (word.EndsWith("s", StringComparison.OrdinalIgnoreCase))
            return word;

        // Common irregular plurals
        var irregulars = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "History", "Histories" },
            { "AuditHistory", "AuditHistories" }
        };

        if (irregulars.TryGetValue(word, out var plural))
            return plural;

        // Words ending in 'y' preceded by consonant
        if (word.EndsWith("y", StringComparison.OrdinalIgnoreCase) &&
            word.Length > 1 &&
            !"aeiou".Contains(char.ToLower(word[^2])))
            return word[..^1] + "ies";

        // Words ending in 's', 'x', 'z', 'ch', 'sh'
        if (word.EndsWith("x", StringComparison.OrdinalIgnoreCase) ||
            word.EndsWith("z", StringComparison.OrdinalIgnoreCase) ||
            word.EndsWith("ch", StringComparison.OrdinalIgnoreCase) ||
            word.EndsWith("sh", StringComparison.OrdinalIgnoreCase))
            return word + "es";

        // Default: add 's'
        return word + "s";
    }
}
