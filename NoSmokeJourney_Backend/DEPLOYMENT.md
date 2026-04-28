# No Smoke Journey - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Deployment](#local-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Azure Deployment](#azure-deployment)
5. [IIS Deployment](#iis-deployment)
6. [Database Migration](#database-migration)
7. [Environment Configuration](#environment-configuration)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- .NET 8.0 SDK
- SQL Server (2019 or later) or SQL Server Express
- Docker (optional, for containerized deployment)
- IIS (optional, for Windows deployment)

### Required Knowledge
- Basic understanding of ASP.NET Core
- SQL Server management
- Windows/Linux server administration

## Local Deployment

### Step 1: Clone Repository
```bash
git clone https://github.com/your-org/NoSmokeJourney.git
cd NoSmokeJourney
```

### Step 2: Configure Database
1. Open SQL Server Management Studio (SSMS)
2. Create a new database: `NoSmokeJourneyDB`
3. Update connection string in `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=NoSmokeJourneyDB;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

### Step 3: Configure JWT Secret
Generate a strong secret key (at least 32 characters):

```bash
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { [byte]$_ }))
```

Update `appsettings.json`:
```json
"JwtSettings": {
  "SecretKey": "your-generated-secret-key-here",
  "Issuer": "NoSmokeJourney",
  "Audience": "NoSmokeJourneyUsers"
}
```

### Step 4: Restore Packages
```bash
dotnet restore
```

### Step 5: Build Project
```bash
dotnet build --configuration Release
```

### Step 6: Run Migrations
```bash
cd NoSmokeJourney.API
dotnet ef database update --project ../NoSmokeJourney.Infrastructure
```

### Step 7: Run Application
```bash
dotnet run --configuration Release
```

Access the API at: `https://localhost:5001`

## Docker Deployment

### Step 1: Build Docker Image
```bash
docker build -t nosmokejourney-api -f NoSmokeJourney.API/Dockerfile .
```

### Step 2: Run with Docker Compose
```bash
docker-compose up -d
```

This will:
- Start SQL Server container
- Start API container
- Create network between containers
- Persist database data

### Step 3: Verify Deployment
```bash
docker-compose ps
docker logs nosmokejourney-api
```

### Step 4: Access API
- API: `http://localhost:5000`
- Swagger: `http://localhost:5000/swagger`

### Docker Commands Reference
```bash
# Stop containers
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# View logs
docker-compose logs -f api

# Execute commands in container
docker exec -it nosmokejourney-api bash
```

## Azure Deployment

### Option 1: Azure App Service

#### Step 1: Create Azure Resources
```bash
# Login to Azure
az login

# Create resource group
az group create --name NoSmokeJourney-RG --location eastus

# Create App Service Plan
az appservice plan create \
  --name NoSmokeJourney-Plan \
  --resource-group NoSmokeJourney-RG \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name nosmokejourney-api \
  --resource-group NoSmokeJourney-RG \
  --plan NoSmokeJourney-Plan \
  --runtime "DOTNETCORE:8.0"

# Create SQL Server
az sql server create \
  --name nosmokejourney-sql \
  --resource-group NoSmokeJourney-RG \
  --location eastus \
  --admin-user sqladmin \
  --admin-password YourStrongPassword123!

# Create SQL Database
az sql db create \
  --name NoSmokeJourneyDB \
  --server nosmokejourney-sql \
  --resource-group NoSmokeJourney-RG \
  --service-objective S0
```

#### Step 2: Configure Connection String
```bash
az webapp config connection-string set \
  --name nosmokejourney-api \
  --resource-group NoSmokeJourney-RG \
  --settings DefaultConnection="Server=nosmokejourney-sql.database.windows.net;Database=NoSmokeJourneyDB;User Id=sqladmin;Password=YourStrongPassword123!;" \
  --connection-string-type SQLAzure
```

#### Step 3: Deploy Application
```bash
# Publish application
dotnet publish NoSmokeJourney.API -c Release -o ./publish

# Deploy to Azure
az webapp deploy \
  --name nosmokejourney-api \
  --resource-group NoSmokeJourney-RG \
  --src-path ./publish
```

### Option 2: Azure Container Instances

```bash
# Create container registry
az acr create \
  --name nosmokejourneyacr \
  --resource-group NoSmokeJourney-RG \
  --sku Basic

# Login to ACR
az acr login --name nosmokejourneyacr

# Tag image
docker tag nosmokejourney-api nosmokejourneyacr.azurecr.io/nosmokejourney-api:latest

# Push image
docker push nosmokejourneyacr.azurecr.io/nosmokejourney-api:latest

# Create container instance
az container create \
  --name nosmokejourney-api \
  --resource-group NoSmokeJourney-RG \
  --image nosmokejourneyacr.azurecr.io/nosmokejourney-api:latest \
  --cpu 1 \
  --memory 1.5 \
  --ports 80 443 \
  --ip-address Public
```

## IIS Deployment

### Step 1: Install Prerequisites
- IIS with ASP.NET Core Hosting Bundle
- .NET 8.0 Runtime

### Step 2: Publish Application
```bash
dotnet publish NoSmokeJourney.API -c Release -o C:\Publish\NoSmokeJourney
```

### Step 3: Configure IIS
1. Open IIS Manager
2. Create new Application Pool:
   - Name: `NoSmokeJourneyAppPool`
   - .NET CLR Version: `No Managed Code`
   - Managed Pipeline Mode: `Integrated`

3. Create new Website:
   - Site Name: `NoSmokeJourney`
   - Application Pool: `NoSmokeJourneyAppPool`
   - Physical Path: `C:\Publish\NoSmokeJourney`
   - Binding: Port 80 or 443

### Step 4: Configure web.config
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified"/>
    </handlers>
    <aspNetCore processPath="dotnet" arguments=".\NoSmokeJourney.API.dll" stdoutLogEnabled="false" hostingModel="InProcess"/>
  </system.webServer>
</configuration>
```

### Step 5: Set Permissions
Grant `IIS_IUSRS` read/execute permissions on the publish folder.

## Database Migration

### Create Migration
```bash
cd NoSmokeJourney.Infrastructure
dotnet ef migrations add MigrationName --startup-project ../NoSmokeJourney.API
```

### Apply Migration
```bash
dotnet ef database update --startup-project ../NoSmokeJourney.API
```

### Script Migration (for production)
```bash
dotnet ef migrations script --startup-project ../NoSmokeJourney.API --output migration.sql
```

### Rollback Migration
```bash
dotnet ef database update PreviousMigrationName --startup-project ../NoSmokeJourney.API
```

## Environment Configuration

### Development
File: `appsettings.Development.json`
```json
{
  "Logging": { "LogLevel": { "Default": "Debug" } },
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=NoSmokeJourneyDB_Dev;..."
  }
}
```

### Staging
File: `appsettings.Staging.json`
```json
{
  "Logging": { "LogLevel": { "Default": "Information" } },
  "ConnectionStrings": {
    "DefaultConnection": "Server=staging-server;Database=NoSmokeJourneyDB_Staging;..."
  }
}
```

### Production
File: `appsettings.Production.json`
```json
{
  "Logging": { "LogLevel": { "Default": "Warning" } },
  "ConnectionStrings": {
    "DefaultConnection": "Server=prod-server;Database=NoSmokeJourneyDB;..."
  },
  "JwtSettings": {
    "SecretKey": "${JWT_SECRET}"  // From environment variable
  }
}
```

### Environment Variables
```bash
# Windows
set ASPNETCORE_ENVIRONMENT=Production
set ConnectionStrings__DefaultConnection="your-connection-string"
set JwtSettings__SecretKey="your-secret-key"

# Linux/macOS
export ASPNETCORE_ENVIRONMENT=Production
export ConnectionStrings__DefaultConnection="your-connection-string"
export JwtSettings__SecretKey="your-secret-key"
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
**Error:** `A network-related or instance-specific error occurred...`

**Solution:**
- Verify SQL Server is running
- Check connection string
- Enable TCP/IP in SQL Server Configuration Manager
- Open firewall port 1433

#### 2. JWT Token Validation Failed
**Error:** `Bearer error="invalid_token"`

**Solution:**
- Verify JWT secret key is at least 32 characters
- Check token hasn't expired
- Ensure correct issuer and audience

#### 3. 500 Internal Server Error
**Solution:**
- Check application logs
- Verify all environment variables are set
- Check database migrations are applied

#### 4. CORS Errors
**Solution:**
- Update CORS policy in `Program.cs`
- Add allowed origins

#### 5. Docker Container Won't Start
**Solution:**
```bash
# Check logs
docker logs nosmokejourney-api

# Check container status
docker ps -a

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### Health Check Endpoint
```http
GET /health
```

Expected response:
```json
{
  "status": "Healthy",
  "checks": {
    "database": "Healthy",
    "memory": "Healthy"
  }
}
```

### Logging
Enable detailed logging:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Debug"
    }
  }
}
```

## Performance Optimization

### 1. Enable Response Compression
```csharp
builder.Services.AddResponseCompression();
app.UseResponseCompression();
```

### 2. Enable Response Caching
```csharp
builder.Services.AddResponseCaching();
app.UseResponseCaching();
```

### 3. Database Optimization
- Add indexes on frequently queried columns
- Use pagination for large datasets
- Enable query caching

### 4. Application Insights (Azure)
```bash
az extension add --name application-insights
az monitor app-insights component create --app nosmokejourney-ai --location eastus --resource-group NoSmokeJourney-RG
```

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Store secrets in environment variables
- [ ] Use strong JWT secret key
- [ ] Enable CORS with specific origins
- [ ] Implement rate limiting
- [ ] Use parameterized queries (EF Core does this automatically)
- [ ] Validate all inputs
- [ ] Enable logging and monitoring
- [ ] Regular security updates
- [ ] Database backups

## Backup Strategy

### Database Backup
```sql
-- Full backup
BACKUP DATABASE NoSmokeJourneyDB TO DISK = 'C:\Backups\NoSmokeJourneyDB_Full.bak'

-- Differential backup
BACKUP DATABASE NoSmokeJourneyDB TO DISK = 'C:\Backups\NoSmokeJourneyDB_Diff.bak' WITH DIFFERENTIAL
```

### Automated Backup (Azure)
```bash
az sql db backup short-term-retention set \
  --name NoSmokeJourneyDB \
  --server nosmokejourney-sql \
  --resource-group NoSmokeJourney-RG \
  --retention-days 35
```

## Monitoring

### Application Insights
```csharp
builder.Services.AddApplicationInsightsTelemetry();
```

### Health Checks
```csharp
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>();

app.UseHealthChecks("/health");
```

---

For more information, see:
- [README.md](README.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
