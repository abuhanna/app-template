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

1. Run the API: `./mvnw spring-boot:run` (or run `Application.java` in IDE)
2. API Docs: `http://localhost:8080/swagger-ui.html`

## Adding a New Feature

1. Create package: `com.apptemplate.api.features.yourfeature`
2. Add Controller, Service, Repository, Model classes there.
