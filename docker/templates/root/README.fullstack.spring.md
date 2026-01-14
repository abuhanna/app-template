# AppTemplate - Fullstack Spring Boot + Vue

This project was generated using [`create-apptemplate`](https://github.com/abuhannaa/app-template). It features a **Spring Boot 3** backend and a **Vue 3** frontend, pre-configured for containerized deployment.

## Tech Stack

### Backend (Spring Boot)
- **Framework**: Spring Boot 3
- **Language**: Java 17+
- **Database**: PostgreSQL with JPA/Hibernate
- **Auth**: Spring Security + JWT

### Frontend (Vue 3)
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **UI Library**: Included (Vuetify or PrimeVue dependent on selection)

### Infrastructure
- **Docker**: Containerized services
- **Nginx**: Reverse proxy for single-port access
- **Supervisor**: Process management

---

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Java 17+](https://adoptium.net/) (for local backend dev)
- [Node.js 20+](https://nodejs.org/) (for local frontend dev)

### Option 1: Run with Docker (Recommended)

```bash
# 1. Configure Environment
cp .env.example .env

# 2. Start Services
docker compose up -d --build
```

**Access Points:**
- **Frontend App**: http://localhost
- **Backend API**: http://localhost:5100
- **Swagger UI**: http://localhost:5100/swagger
- **Database**: localhost:5432

### Option 2: Run Locally (Manual)

**1. Start Database**
```bash
docker compose up db -d
```

**2. Start Backend**
```bash
cd backend
./mvnw spring-boot:run
```
*Backend runs at `http://localhost:5100`*

**3. Start Frontend**
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:3000`*

---

## Project Structure

```
.
├── backend/            # Spring Boot Project (Multi-module)
├── frontend/           # Vue 3 Vite Project
├── docker/             # Docker configurations
├── docker-compose.yml  # Root composition file
└── Dockerfile          # Multi-stage production build
```

## Documentation

- **Backend Details**: See [backend/README.md](./backend/README.md).
- **Frontend Details**: See [frontend/README.md](./frontend/README.md).

## Default Credentials

- **Username**: `admin`
- **Password**: `Admin@123`
