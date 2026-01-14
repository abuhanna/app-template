# ================================
# Multi-stage Dockerfile
# Combines Backend (Spring Boot) + Frontend (Vue 3) + Nginx
# Single container deployment
# ================================

# ================================
# Stage 1: Build Backend (Spring Boot)
# ================================
FROM eclipse-temurin:21-jdk-alpine AS backend-build
WORKDIR /backend-spring

# Copy wrapper and pom files
COPY backend-spring/mvnw .
COPY backend-spring/.mvn .mvn
COPY backend-spring/pom.xml .
COPY backend-spring/domain/pom.xml domain/
COPY backend-spring/application/pom.xml application/
COPY backend-spring/infrastructure/pom.xml infrastructure/
COPY backend-spring/api/pom.xml api/

# Download dependencies
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source
COPY backend-spring/domain/src domain/src
COPY backend-spring/application/src application/src
COPY backend-spring/infrastructure/src infrastructure/src
COPY backend-spring/api/src api/src

# Build
RUN ./mvnw clean package -DskipTests -B

# ================================
# Stage 2: Build Frontend (Vue 3)
# ================================
FROM node:20-alpine AS frontend-build
WORKDIR /frontend-vuetify

# Copy package files
COPY frontend-vuetify/package*.json ./
RUN npm ci

# Copy source
COPY frontend-vuetify/ ./

# Build for production
ARG VITE_API_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_URL}
RUN npm run build

# ================================
# Stage 3: Runtime (Backend + Frontend + Nginx)
# ================================
FROM eclipse-temurin:21-jre-alpine AS runtime

# Install nginx and supervisor
RUN apk add --no-cache nginx supervisor curl

# Create app directory
WORKDIR /app/backend

# Copy backend from build stage
COPY --from=backend-build /backend-spring/api/target/*.jar app.jar

# Copy frontend build from build stage
COPY --from=frontend-build /frontend-vuetify/dist /usr/share/nginx/html

# Configure Nginx
RUN rm -f /etc/nginx/http.d/default.conf
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf

# Configure Supervisor
COPY docker/supervisor/supervisord.conf /etc/supervisor.d/supervisord.ini

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start supervisor
CMD ["supervisord", "-c", "/etc/supervisor.d/supervisord.ini"]
