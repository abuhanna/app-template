# Version Alignment

All variants within each stack use identical dependency versions.
Baseline: `clean-architecture/full` for each stack.

**Last aligned:** 2026-03-07

---

## .NET 8

| Package | Version | Used In |
|---------|---------|---------|
| **Framework** | | |
| .NET SDK / Runtime | 8.0 | All |
| **Data Access** | | |
| Microsoft.EntityFrameworkCore | 8.0.22 | All |
| Microsoft.EntityFrameworkCore.Design | 8.0.22 | All |
| Npgsql.EntityFrameworkCore.PostgreSQL | 8.0.11 | All |
| EFCore.NamingConventions | 8.0.3 | All |
| **Authentication** | | |
| Microsoft.AspNetCore.Authentication.JwtBearer | 8.0.22 | All |
| Microsoft.IdentityModel.Tokens | 8.15.0 | All |
| System.IdentityModel.Tokens.Jwt | 8.15.0 | All |
| BCrypt.Net-Next | 4.0.3 | Full variants |
| **CQRS (Clean-arch only)** | | |
| MediatR | 12.5.0 | Clean |
| FluentValidation | 12.1.0 | Clean |
| FluentValidation.AspNetCore | 11.3.1 | Feature, N-Layer |
| **API & Middleware** | | |
| Swashbuckle.AspNetCore | 8.1.4 | All |
| AspNetCoreRateLimit | 5.0.0 | All |
| **Logging** | | |
| Serilog.AspNetCore | 10.0.0 | All |
| Serilog.Sinks.File | 7.0.0 | All |
| Serilog.Enrichers.Environment | 3.0.1 | All |
| Serilog.Formatting.Compact | 3.0.0 | All |
| **Export** | | |
| CsvHelper | 33.0.1 | Full variants |
| ClosedXML | 0.104.2 | Full variants |
| QuestPDF | 2024.10.2 | Full variants |
| **Testing** | | |
| xunit | 2.9.3 | All |
| xunit.runner.visualstudio | 3.1.4 | All |
| Moq | 4.20.72 | All |
| Microsoft.NET.Test.Sdk | 17.14.1 | All |
| coverlet.collector | 6.0.4 | All |

---

## Spring Boot 3

| Package | Version | Used In |
|---------|---------|---------|
| **Framework** | | |
| Spring Boot (parent) | 3.3.5 | All |
| Java | 21 | All |
| Maven Compiler Plugin | 3.11.0 | All |
| **Authentication** | | |
| JJWT (api/impl/jackson) | 0.12.5 | All |
| **Mapping & Utilities** | | |
| MapStruct | 1.5.5.Final | Clean |
| Lombok | 1.18.30 | Clean |
| **API Docs** | | |
| SpringDoc OpenAPI | 2.3.0 | Clean |
| SpringDoc OpenAPI | 2.2.0 | Feature, N-Layer |
| **Rate Limiting** | | |
| Bucket4j | 8.7.0 | Clean |
| **Export** | | |
| Apache POI | 5.2.3 | Full variants |
| Apache Commons CSV | 1.10.0 | Full variants |
| iText7 | 8.0.2 | Clean full |
| **Logging** | | |
| Logstash Logback Encoder | 7.4 | All |
| **Database** | | |
| PostgreSQL (driver) | Runtime (Spring managed) | All |
| Flyway | Spring managed | Clean |
| H2 (test) | Spring managed | Clean (test scope) |

---

## NestJS 10

| Package | Version | Used In |
|---------|---------|---------|
| **Framework** | | |
| @nestjs/common | ^10.4.0 | All |
| @nestjs/core | ^10.4.0 | All |
| @nestjs/platform-express | ^10.4.0 | All |
| @nestjs/cli | ^10.4.0 | All (dev) |
| **Configuration** | | |
| @nestjs/config | ^3.3.0 | All |
| **CQRS (Clean-arch only)** | | |
| @nestjs/cqrs | ^10.2.0 | Clean |
| **Authentication** | | |
| @nestjs/jwt | ^10.2.0 | All |
| @nestjs/passport | ^10.0.3 | All |
| passport-jwt | ^4.0.1 | All |
| bcrypt | ^5.1.1 | All |
| **API Docs** | | |
| @nestjs/swagger | ^7.4.0 | All |
| **Data Access** | | |
| @nestjs/typeorm | ^10.0.2 | All |
| typeorm | ^0.3.20 | All |
| pg | ^8.12.0 | All |
| **Validation** | | |
| class-validator | ^0.14.1 | All |
| class-transformer | ^0.5.1 | All |
| **Real-time** | | |
| @nestjs/websockets | ^10.4.0 | All |
| @nestjs/platform-socket.io | ^10.4.0 | All |
| socket.io | ^4.7.5 | All |
| **Logging** | | |
| nestjs-pino | ^4.5.0 | Clean |
| pino | ^10.2.0 | Clean |
| pino-http | ^10.2.0 | Clean |
| pino-pretty | ^13.0.0 | Clean (dev) |
| **Export** | | |
| exceljs | ^4.4.0 | Full variants |
| json2csv | (bundled) | Full variants |
| pdfkit | (bundled) | Full variants |
| **Utilities** | | |
| reflect-metadata | ^0.2.2 | All |
| rxjs | ^7.8.1 | All |
| uuid | ^10.0.0 | Clean |
| **Testing** | | |
| jest | ^29.7.0 | All |
| ts-jest | ^29.2.0 | All |
| @nestjs/testing | ^10.4.0 | All |
| **Dev Tools** | | |
| typescript | ^5.5.0 | All |
| eslint | ^8.57.0 | All |
| prettier | ^3.3.0 | All |
| Node.js (Docker) | 20-alpine | All |

---

## Frontend — Vue

| Package | Vuetify | PrimeVue |
|---------|---------|----------|
| **Core** | | |
| vue | ^3.5.21 | ^3.5.21 |
| vue-router | ^4.5.1 | ^4.5.1 |
| pinia | ^3.0.3 | ^3.0.3 |
| vue-i18n | ^9.14.5 | ^9.14.5 |
| **UI Library** | | |
| vuetify | ^3.10.1 | — |
| primevue | — | ^4.2.0 |
| primeflex | — | ^4.0.0 |
| primeicons | — | ^7.0.0 |
| **Build** | | |
| vite | ^7.1.5 | ^7.1.5 |
| @vitejs/plugin-vue | ^6.0.1 | ^6.0.1 |
| unplugin-vue-router | ^0.15.0 | ^0.15.0 |
| unplugin-vue-components | ^29.0.0 | ^29.0.0 |
| unplugin-auto-import | ^19.3.0 | ^19.3.0 |
| vite-plugin-vue-layouts-next | ^1.0.0 | ^1.0.0 |
| sass-embedded | ^1.92.1 | ^1.92.1 |
| **HTTP & Real-time** | | |
| axios | ^1.13.2 | ^1.13.2 |
| @microsoft/signalr | ^10.0.0 | ^10.0.0 |
| @stomp/stompjs | ^7.2.1 | ^7.2.1 |
| socket.io-client | ^4.8.3 | ^4.8.3 |
| **Quality** | | |
| eslint | ^9.35.0 | ^9.35.0 |
| prettier | ^3.5.0 | ^3.5.0 |
| husky | ^9.1.7 | ^9.1.7 |
| lint-staged | ^16.1.0 | ^16.1.0 |
| **Testing** | | |
| vitest | ^3.2.3 | ^3.2.3 |
| @vue/test-utils | ^2.4.6 | ^2.4.6 |
| jsdom | ^26.1.0 | ^26.1.0 |
| **Icons / Fonts** | | |
| @mdi/font | 7.4.47 | — |
| @fontsource/roboto | 5.2.7 | — |

---

## Frontend — React

| Package | MUI | PrimeReact |
|---------|-----|------------|
| **Core** | | |
| react | ^19.1.0 | ^19.1.0 |
| react-dom | ^19.1.0 | ^19.1.0 |
| react-router-dom | ^7.6.1 | ^7.6.1 |
| zustand | ^5.0.5 | ^5.0.5 |
| i18next | ^25.7.4 | ^25.7.4 |
| react-i18next | ^16.5.3 | ^16.5.3 |
| **UI Library** | | |
| @mui/material | ^7.0.2 | — |
| @mui/icons-material | ^7.0.2 | — |
| @emotion/react | ^11.14.0 | — |
| @emotion/styled | ^11.14.0 | — |
| primereact | — | ^10.9.5 |
| primeflex | — | ^4.0.0 |
| primeicons | — | ^7.0.0 |
| **Build** | | |
| vite | ^7.1.5 | ^7.1.5 |
| @vitejs/plugin-react | ^4.5.0 | ^4.5.0 |
| typescript | ~5.8.3 | ~5.8.3 |
| sass | — | ^1.89.1 |
| **HTTP & Real-time** | | |
| axios | ^1.13.2 | ^1.13.2 |
| @microsoft/signalr | ^10.0.0 | ^10.0.0 |
| @stomp/stompjs | ^7.2.1 | ^7.2.1 |
| socket.io-client | ^4.8.3 | ^4.8.3 |
| **Quality** | | |
| eslint | ^9.27.0 | ^9.27.0 |
| typescript-eslint | ^8.32.1 | ^8.32.1 |
| prettier | ^3.5.3 | ^3.5.3 |
| **Testing** | | |
| vitest | ^3.2.3 | ^3.2.3 |
| @testing-library/react | ^16.3.0 | ^16.3.0 |
| @testing-library/jest-dom | ^6.6.3 | ^6.6.3 |
| jsdom | ^26.1.0 | ^26.1.0 |

---

## CLI Tool (`create-apptemplate`)

| Package | Version | Type |
|---------|---------|------|
| @clack/prompts | ^0.9.1 | Runtime |
| cross-spawn | ^7.0.6 | Runtime |
| degit | ^2.8.4 | Runtime |
| picocolors | ^1.1.1 | Runtime |
| tsup | ^8.3.5 | Dev |
| typescript | ^5.7.3 | Dev |
| vitest | ^3.2.3 | Dev |
| @types/node | ^22.10.5 | Dev |
| @types/cross-spawn | ^6.0.6 | Dev |
| @types/degit | ^2.8.6 | Dev |

---

## Docker / Infrastructure

| Component | Version |
|-----------|---------|
| PostgreSQL | 15-alpine |
| Node.js (Docker) | 20-alpine / 20-slim |
| .NET SDK (Docker) | 8.0 |
| .NET Runtime (Docker) | aspnet:8.0 |
| Eclipse Temurin JDK (Docker) | 21-jdk-alpine |
| Eclipse Temurin JRE (Docker) | 21-jre-alpine |
| Nginx | alpine (latest) |

---

## Maintenance

When adding or updating a dependency:

1. Update the `clean-architecture/full` baseline first
2. Apply the same version to all other variants of the same stack
3. Build all variants to verify: `dotnet build` / `mvn compile` / `npm run build`
4. Update this document with the new version
5. Run the variant validation: see [cli-development.md](cli-development.md) for the validate-matrix skill
