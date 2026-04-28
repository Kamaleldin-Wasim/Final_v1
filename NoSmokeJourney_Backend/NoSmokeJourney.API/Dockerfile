FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["NoSmokeJourney.API/NoSmokeJourney.API.csproj", "NoSmokeJourney.API/"]
COPY ["NoSmokeJourney.Services/NoSmokeJourney.Services.csproj", "NoSmokeJourney.Services/"]
COPY ["NoSmokeJourney.Infrastructure/NoSmokeJourney.Infrastructure.csproj", "NoSmokeJourney.Infrastructure/"]
COPY ["NoSmokeJourney.Core/NoSmokeJourney.Core.csproj", "NoSmokeJourney.Core/"]

# Restore dependencies
RUN dotnet restore "NoSmokeJourney.API/NoSmokeJourney.API.csproj"

# Copy source code
COPY . .

# Build
WORKDIR "/src/NoSmokeJourney.API"
RUN dotnet build "NoSmokeJourney.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "NoSmokeJourney.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "NoSmokeJourney.API.dll"]
