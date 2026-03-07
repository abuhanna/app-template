# ================================
# Multi-stage Dockerfile
# Combines Backend (.NET 8) + Frontend (Vue 3) + Nginx
# Single container deployment
# ================================

# ================================
# Stage 1: Build Backend (.NET 8)
# ================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /backend-dotnet

# Copy backend source
COPY backend-dotnet/ ./

# Restore dependencies using the main project
RUN dotnet restore src/Presentation/App.Template.WebAPI/App.Template.WebAPI.csproj

# Build and publish
RUN dotnet publish src/Presentation/App.Template.WebAPI/App.Template.WebAPI.csproj \
    -c Release \
    -o /app/backend \
    --no-restore

# ================================
# Stage 2: Build Frontend (Vue 3)
# ================================
FROM node:20-alpine AS frontend-build
WORKDIR /frontend-vuetify

# Copy frontend source
COPY frontend-vuetify/package*.json ./
RUN npm ci

COPY frontend-vuetify/ ./

# Build for production
ARG VITE_API_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_URL}
RUN npm run build

# ================================
# Stage 3: Runtime (Backend + Frontend + Nginx)
# ================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

# Install nginx and supervisor
RUN apt-get update && \
    apt-get install -y \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy backend from build stage
COPY --from=backend-build /app/backend ./backend

# Copy frontend build from build stage
COPY --from=frontend-build /frontend-vuetify/dist /usr/share/nginx/html

# Configure Nginx
RUN rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-available/default

# Copy nginx main configuration
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf

# Copy nginx site configuration (will be created below)
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Create supervisor configuration
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
