# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore
COPY src/App.Template.Api/App.Template.Api.csproj src/App.Template.Api/
RUN dotnet restore src/App.Template.Api/App.Template.Api.csproj

# Copy everything else and build
COPY . .
RUN dotnet publish src/App.Template.Api/App.Template.Api.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "App.Template.Api.dll"]
