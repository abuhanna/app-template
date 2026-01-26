# App.Template - Spring Boot N-Layer Architecture

A Spring Boot API template using traditional N-Layer (3-Tier) architecture.

## Architecture

```
src/main/java/com/apptemplate/api/
├── controller/      # API Controllers (Presentation Layer)
├── service/         # Business Logic Layer
├── repository/      # Data Access Layer
├── model/           # JPA Entities
└── dto/             # Data Transfer Objects
```

## Getting Started

1. Run the API: `./mvnw spring-boot:run` (or run `Application.java` in IDE)
2. API Docs: `http://localhost:8080/swagger-ui.html`

## Configuration

Database configuration in `src/main/resources/application.properties`. Defaults to in-memory H2 database.

## When to Use N-Layer

- Simple CRUD applications
- Teams familiar with traditional Java/Spring architecture
- Rapid prototyping
