# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY src/Presentation/App.Template.WebAPI/App.Template.WebAPI.csproj src/Presentation/App.Template.WebAPI/
RUN dotnet restore src/Presentation/App.Template.WebAPI/App.Template.WebAPI.csproj

# Copy everything else and build
COPY . .
RUN dotnet publish src/Presentation/App.Template.WebAPI/App.Template.WebAPI.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "App.Template.WebAPI.dll"]
