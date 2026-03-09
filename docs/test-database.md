# Test Database Connection

## Docker
    ./scripts/test-db.sh start

## Connection Details
- Host: localhost
- Port: 5433
- Database: apptemplate_test
- Username: apptemplate
- Password: apptemplate123

## Connection Strings

### .NET (appsettings.Development.json)
    "ConnectionStrings": {
      "DefaultConnection": "Host=localhost;Port=5433;Database=apptemplate_test;Username=apptemplate;Password=apptemplate123"
    }

### Spring Boot (application-dev.yml)
    spring:
      datasource:
        url: jdbc:postgresql://localhost:5433/apptemplate_test
        username: apptemplate
        password: apptemplate123

### NestJS (.env)
    DATABASE_HOST=localhost
    DATABASE_PORT=5433
    DATABASE_NAME=apptemplate_test
    DATABASE_USER=apptemplate
    DATABASE_PASSWORD=apptemplate123
