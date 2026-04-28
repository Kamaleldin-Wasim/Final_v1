# No Smoke Journey - Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture Layers](#architecture-layers)
3. [Design Patterns](#design-patterns)
4. [Data Flow](#data-flow)
5. [Security](#security)
6. [Scalability](#scalability)

## Overview

No Smoke Journey follows a **Clean Architecture** approach with **N-Tier Architecture** principles. The solution is organized into four distinct layers, each with a specific responsibility.

## Architecture Layers

### 1. Domain Layer (Core)
**Project:** `NoSmokeJourney.Core`

**Responsibilities:**
- Define domain entities
- Define enums and value objects
- Define repository interfaces
- No dependencies on other layers

**Key Components:**
```
Entities/
├── BaseEntity.cs
├── User.cs
├── Smoker.cs
├── Doctor.cs
├── MedicalCenter.cs
├── Seminar.cs
├── RecoveryStory.cs
├── DoctorReview.cs
├── AddictionTest.cs
├── CancerRiskAssessment.cs
├── ProgressTracker.cs
├── EducationalContent.cs
└── HealthMilestone.cs

Enums/
├── UserRole.cs
├── Gender.cs
├── ContentType.cs
├── StoryStatus.cs
├── RiskLevel.cs
├── AddictionLevel.cs
└── RegistrationStatus.cs

Interfaces/
├── IGenericRepository.cs
└── IUnitOfWork.cs
```

### 2. Infrastructure Layer
**Project:** `NoSmokeJourney.Infrastructure`

**Responsibilities:**
- Database access (Entity Framework Core)
- Repository implementations
- External service integrations
- Depends on Domain Layer

**Key Components:**
```
Data/
├── ApplicationDbContext.cs
└── Seed/
    └── DbInitializer.cs

Repositories/
├── GenericRepository.cs
└── UnitOfWork.cs
```

### 3. Business Logic Layer (Services)
**Project:** `NoSmokeJourney.Services`

**Responsibilities:**
- Business logic implementation
- DTOs definition
- Service interfaces and implementations
- AutoMapper configuration
- Depends on Domain and Infrastructure Layers

**Key Components:**
```
DTOs/
├── UserDTOs.cs
├── SmokerDTOs.cs
├── DoctorDTOs.cs
├── MedicalCenterDTOs.cs
├── SeminarDTOs.cs
├── RecoveryStoryDTOs.cs
├── DoctorReviewDTOs.cs
├── AddictionTestDTOs.cs
├── CancerRiskDTOs.cs
├── ProgressTrackerDTOs.cs
├── EducationalContentDTOs.cs
├── HealthMilestoneDTOs.cs
└── ApiResponseDTOs.cs

Interfaces/
├── IAuthService.cs
├── IUserService.cs
├── ISmokerService.cs
├── IDoctorService.cs
├── IMedicalCenterService.cs
├── ISeminarService.cs
├── IRecoveryStoryService.cs
├── IDoctorReviewService.cs
├── IAddictionTestService.cs
├── ICancerRiskService.cs
├── IProgressTrackerService.cs
├── IEducationalContentService.cs
└── IHealthMilestoneService.cs

Implementations/
├── AuthService.cs
├── UserService.cs
├── SmokerService.cs
├── DoctorService.cs
├── MedicalCenterService.cs
├── SeminarService.cs
├── RecoveryStoryService.cs
├── DoctorReviewService.cs
├── AddictionTestService.cs
├── CancerRiskService.cs
├── ProgressTrackerService.cs
├── EducationalContentService.cs
└── HealthMilestoneService.cs

Mappings/
└── MappingProfile.cs
```

### 4. Presentation Layer (API)
**Project:** `NoSmokeJourney.API`

**Responsibilities:**
- HTTP request handling
- Controllers
- Middleware
- Configuration
- Depends on Services Layer

**Key Components:**
```
Controllers/
├── AuthController.cs
├── UsersController.cs
├── SmokersController.cs
├── DoctorsController.cs
├── MedicalCentersController.cs
├── SeminarsController.cs
├── RecoveryStoriesController.cs
├── DoctorReviewsController.cs
├── AddictionTestsController.cs
├── CancerRiskController.cs
├── ProgressTrackerController.cs
├── EducationalContentController.cs
└── HealthMilestonesController.cs

Middleware/
└── (Custom middleware)

Configuration/
├── appsettings.json
├── appsettings.Development.json
└── Program.cs
```

## Design Patterns

### 1. Repository Pattern
```csharp
public interface IGenericRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> expression);
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
}
```

**Benefits:**
- Abstraction of data access
- Testability
- Centralized data access logic
- Easy to switch data sources

### 2. Unit of Work Pattern
```csharp
public interface IUnitOfWork : IDisposable
{
    IGenericRepository<T> Repository<T>() where T : class;
    Task<int> CompleteAsync();
}
```

**Benefits:**
- Transaction management
- Consistent data operations
- Reduced database round trips

### 3. Dependency Injection
All services are registered in `Program.cs`:
```csharp
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
// ... etc
```

### 4. DTO Pattern
Data Transfer Objects separate domain models from API contracts:
```csharp
public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
}
```

### 5. AutoMapper
Object-to-object mapping:
```csharp
CreateMap<User, UserDto>();
CreateMap<UserRegisterDto, User>();
```

## Data Flow

### Request Flow
```
1. HTTP Request
   ↓
2. Controller (NoSmokeJourney.API)
   ↓
3. Service (NoSmokeJourney.Services)
   ↓
4. Repository (NoSmokeJourney.Infrastructure)
   ↓
5. Database (SQL Server)
```

### Response Flow
```
1. Database
   ↓
2. Entity (NoSmokeJourney.Core)
   ↓
3. DTO (NoSmokeJourney.Services)
   ↓
4. Controller (NoSmokeJourney.API)
   ↓
5. HTTP Response
```

## Security

### Authentication
- JWT (JSON Web Tokens)
- Token expiration: 2 hours
- Refresh token support

### Authorization
- Role-based access control
- Claims-based authorization
- Policies for fine-grained control

### Password Security
- BCrypt hashing
- Salt rounds: 10

### HTTPS
- Enforced in production
- Development certificate support

## Scalability

### Horizontal Scaling
- Stateless API design
- JWT tokens enable distributed systems
- No session state on server

### Database
- Connection pooling
- Retry logic for transient failures
- Indexing on frequently queried columns

### Caching (Future)
- Redis integration planned
- Response caching
- Output caching

## Entity Relationships

```
User (1) --- (1) Smoker
User (1) --- (1) Doctor
User (1) --- (*) RecoveryStory
User (1) --- (*) DoctorReview
User (1) --- (*) SeminarRegistration

Smoker (1) --- (*) AddictionTest
Smoker (1) --- (*) CancerRiskAssessment
Smoker (1) --- (1) ProgressTracker

Doctor (*) --- (0..1) MedicalCenter
Doctor (1) --- (*) DoctorReview

Seminar (1) --- (*) SeminarRegistration
```

## Database Schema

See [ER Diagram](docs/ERD.png) for visual representation.

### Key Tables
- **Users**: User accounts and authentication
- **Smokers**: Smoker profiles and smoking history
- **Doctors**: Doctor profiles and specializations
- **MedicalCenters**: Healthcare facilities
- **Seminars**: Awareness events and workshops
- **RecoveryStories**: Community success stories
- **AddictionTests**: Fagerström test results
- **CancerRiskAssessments**: Risk evaluation results
- **ProgressTrackers**: Quit journey tracking
- **EducationalContents**: Articles, videos, infographics
- **HealthMilestones**: Recovery timeline milestones

## Testing Strategy

### Unit Tests
- Service layer testing
- Repository mocking
- Business logic validation

### Integration Tests
- API endpoint testing
- Database integration
- Authentication flow

### Future Plans
- Load testing
- Security testing
- Performance testing

## Deployment

### Docker
```dockerfile
# Multi-stage build for optimized image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
# ... build steps
```

### Docker Compose
```yaml
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
  api:
    build: .
    depends_on:
      - sqlserver
```

## Monitoring and Logging

### Future Enhancements
- Application Insights integration
- Structured logging with Serilog
- Health checks endpoint
- Metrics collection

## Best Practices Followed

1. **SOLID Principles**
   - Single Responsibility
   - Open/Closed
   - Liskov Substitution
   - Interface Segregation
   - Dependency Inversion

2. **Clean Code**
   - Meaningful names
   - Small methods
   - DRY principle
   - Comments where needed

3. **Security**
   - Input validation
   - Output encoding
   - Authentication/Authorization
   - Secure configuration

4. **Performance**
   - Async/await
   - Efficient queries
   - Pagination
   - Resource cleanup

## Future Architecture Improvements

1. **Microservices**: Split into smaller services
2. **Event-Driven**: Implement event sourcing
3. **CQRS**: Command Query Responsibility Segregation
4. **GraphQL**: Alternative to REST
5. **gRPC**: High-performance RPC
6. **Message Queue**: Async processing
7. **CDN**: Static content delivery

---

For more information, see:
- [README.md](README.md)
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
