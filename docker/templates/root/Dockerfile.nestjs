# ================================
# Multi-stage Dockerfile
# Combines Backend (NestJS) + Frontend (Vue 3) + Nginx
# Single container deployment
# ================================

# ================================
# Stage 1: Build Backend (NestJS)
# ================================
FROM node:20-alpine AS backend-build
WORKDIR /backend-nestjs

# Copy package files
COPY backend-nestjs/package*.json ./
RUN npm ci

# Copy source
COPY backend-nestjs/ ./

# Build
RUN npm run build

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
FROM node:20-slim AS runtime

# Install nginx and supervisor
RUN apt-get update && \
    apt-get install -y \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app/backend

# Copy backend from build stage
COPY --from=backend-build /backend-nestjs/dist ./dist
COPY --from=backend-build /backend-nestjs/package*.json ./
COPY --from=backend-build /backend-nestjs/node_modules ./node_modules

# Copy frontend build from build stage
COPY --from=frontend-build /frontend-vuetify/dist /usr/share/nginx/html

# Configure Nginx
RUN rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-available/default
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Configure Supervisor
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
