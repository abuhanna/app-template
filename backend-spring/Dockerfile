# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

# Copy Maven wrapper and pom files
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY app-domain/pom.xml app-domain/
COPY app-application/pom.xml app-application/
COPY app-infrastructure/pom.xml app-infrastructure/
COPY app-api/pom.xml app-api/

# Download dependencies
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source code
COPY app-domain/src app-domain/src
COPY app-application/src app-application/src
COPY app-infrastructure/src app-infrastructure/src
COPY app-api/src app-api/src

# Build application
RUN ./mvnw clean package -DskipTests -B

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1000 spring && \
    adduser -u 1000 -G spring -s /bin/sh -D spring

# Copy built artifact
COPY --from=build /app/app-api/target/*.jar app.jar

# Change ownership
RUN chown -R spring:spring /app

USER spring

EXPOSE 5100

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5100/health || exit 1

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
