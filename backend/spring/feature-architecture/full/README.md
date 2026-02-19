# App.Template - Spring Boot Package by Feature Architecture

A Spring Boot API template using Package by Feature (modular) architecture.

## Architecture

```
src/main/java/com/apptemplate/api/
├── features/
│   └── users/           # User feature module
│       ├── UserController.java
│       ├── UserService.java
│       ├── UserRepository.java
│       ├── User.java     # Entity
│       └── dto/
│           └── UserDto.java
└── common/              # Shared utilities
```

## Key Principles

1. **Feature Isolation**: Each feature package contains its own Controller, Service, Repository, and Entity.
2. **Modularity**: Easy to extract features into microservices later if needed.
3. **Cohesion**: Related code stays together.

## Getting Started

1. Run the API: `./mvnw spring-boot:run`
2. API Docs: `http://localhost:8080/swagger-ui.html`

### Running with Docker

```bash
docker compose up -d --build
```
API: `http://localhost:8080`

### Running Tests

```bash
./mvnw test
```

## Features

- **Package by Feature**: Modular architecture
- **Global Exception Handling**: `@ControllerAdvice`
- **Docker Support**: Containerized for easy deployment
- **Unit Tests**: JUnit 5 & Mockito setup included

## Adding a New Feature

1. Create package: `com.apptemplate.api.features.yourfeature`
2. Add Controller, Service, Repository, Model classes there.
