using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AppTemplate.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSeedDataFromSnapshot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "id",
                keyValue: 1L);

            migrationBuilder.DeleteData(
                table: "departments",
                keyColumn: "id",
                keyValue: 1L);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "departments",
                columns: new[] { "id", "code", "created_at", "created_by", "description", "is_active", "name", "updated_at", "updated_by" },
                values: new object[] { 1L, "IT", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "IT Department", true, "Information Technology", null, null });

            migrationBuilder.InsertData(
                table: "users",
                columns: new[] { "id", "created_at", "created_by", "department_id", "email", "is_active", "last_login_at", "name", "password_hash", "password_reset_token", "password_reset_token_expiry", "role", "updated_at", "updated_by", "username" },
                values: new object[] { 1L, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, 1L, "admin@apptemplate.local", true, null, "System Administrator", "$2a$11$K7C5P1yZh9rV1sX4nBqH6OqP8rZYPwGXLO5mYJK.4VKQJq9qQZwKu", null, null, "Admin", null, null, "admin" });
        }
    }
}
