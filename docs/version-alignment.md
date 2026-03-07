# Version Alignment

All variants within each stack use identical dependency versions.
Baseline: `clean-architecture/full` for each stack.

**Last aligned:** 2026-03-07

## .NET 8

| Package | Version |
|---------|---------|
| Serilog.AspNetCore | 10.0.0 |
| Serilog.Sinks.File | 7.0.0 |
| Serilog.Enrichers.Environment | 3.0.1 |
| Serilog.Formatting.Compact | 3.0.0 |
| Swashbuckle.AspNetCore | 8.1.4 |
| FluentValidation.AspNetCore | 11.3.1 |
| Microsoft.EntityFrameworkCore | 8.0.22 |
| Microsoft.EntityFrameworkCore.Design | 8.0.22 |
| Microsoft.AspNetCore.Authentication.JwtBearer | 8.0.22 |
| EFCore.NamingConventions | 8.0.3 |
| Npgsql.EntityFrameworkCore.PostgreSQL | 8.0.11 |
| AspNetCoreRateLimit | 5.0.0 |
| BCrypt.Net-Next | 4.0.3 |
| Microsoft.IdentityModel.Tokens | 8.15.0 |
| System.IdentityModel.Tokens.Jwt | 8.15.0 |
| CsvHelper | 33.0.1 |
| ClosedXML | 0.104.2 |
| QuestPDF | 2024.10.2 |
| xunit | 2.9.3 |
| xunit.runner.visualstudio | 3.1.4 |
| Moq | 4.20.72 |
| Microsoft.NET.Test.Sdk | 17.14.1 |
| coverlet.collector | 6.0.4 |

## Spring Boot

| Package | Version |
|---------|---------|
| Spring Boot | 3.3.5 |
| Java | 21 |
| JJWT (api/impl/jackson) | 0.12.5 |
| SpringDoc OpenAPI | 2.3.0 (clean) / 2.2.0 (feature/nlayer) |
| Apache POI | 5.2.3 |
| Apache Commons CSV | 1.10.0 |

## NestJS

| Package | Version |
|---------|---------|
| @nestjs/common | ^10.4.0 |
| @nestjs/core | ^10.4.0 |
| @nestjs/platform-express | ^10.4.0 |
| @nestjs/config | ^3.3.0 |
| @nestjs/swagger | ^7.4.0 |
| @nestjs/typeorm | ^10.0.2 |
| @nestjs/jwt | ^10.2.0 |
| @nestjs/passport | ^10.0.3 |
| @nestjs/websockets | ^10.4.0 |
| @nestjs/platform-socket.io | ^10.4.0 |
| typeorm | ^0.3.20 |
| pg | ^8.12.0 |
| typescript | ^5.5.0 |
| Node.js (Docker) | 20-alpine |

## Frontend (Vue & React)

| Package | Vue | React |
|---------|-----|-------|
| Vite | ^7.1.5 | ^7.1.5 |
| Vitest | ^3.2.3 | ^3.2.3 |
| Axios | ^1.13.2 | ^1.13.2 |
| PrimeFlex | ^4.0.0 | ^4.0.0 |

## Maintenance

When adding or updating a dependency:

1. Update the `clean-architecture/full` baseline first
2. Apply the same version to all other variants of the same stack
3. Build all variants to verify: `dotnet build` / `mvn compile` / `npm run build`
4. Update this document with the new version
