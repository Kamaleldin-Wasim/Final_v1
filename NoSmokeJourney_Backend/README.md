# 🚭 No Smoke Journey - Backend API

[![.NET](https://img.shields.io/badge/.NET-8.0-blue.svg)](https://dotnet.microsoft.com/)
[![Entity Framework](https://img.shields.io/badge/EF%20Core-8.0-green.svg)](https://docs.microsoft.com/ef/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2019+-red.svg)](https://www.microsoft.com/sql-server)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive ASP.NET Core Web API for a smoking awareness and cessation platform, built with **N-Tier Architecture** and clean code principles.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (User, Admin, Doctor)
- Password hashing with BCrypt
- Secure token management

### 👤 User Management
- User registration and login
- Profile management
- Password change functionality

### 🫁 Health Assessment Tools
- **Nicotine Addiction Test** (Fagerström model) - 6 questions to determine addiction level
- **Cancer Risk Assessment** - Evaluates lung cancer risk based on smoking history and symptoms
- **Progress Tracker** - Tracks smoke-free days, cigarettes avoided, money saved, and health improvements
- **Quit Timeline** - Visual timeline of health recovery milestones

### 📚 Educational Content
- Articles, videos, and infographics
- Interactive body model content
- Content categorization by body organ
- View tracking and analytics

### 👨‍⚕️ Doctor Directory
- Doctor profiles with specializations
- Medical centers with location-based search
- Reviews and ratings system
- Contact information

### 👥 Community Features
- Recovery stories with admin moderation
- Seminar registration system
- Success story sharing

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│              (NoSmokeJourney.API)                           │
│         - Controllers, Middleware, Configuration            │
├─────────────────────────────────────────────────────────────┤
│                    Business Logic Layer                      │
│              (NoSmokeJourney.Services)                      │
│    - Services, DTOs, Interfaces, AutoMapper Profiles        │
├─────────────────────────────────────────────────────────────┤
│                    Data Access Layer                         │
│           (NoSmokeJourney.Infrastructure)                   │
│         - DbContext, Repositories, Unit of Work             │
├─────────────────────────────────────────────────────────────┤
│                      Domain Layer                            │
│               (NoSmokeJourney.Core)                         │
│           - Entities, Enums, Interfaces                     │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns Used
- ✅ Repository Pattern
- ✅ Unit of Work Pattern
- ✅ Dependency Injection
- ✅ DTO Pattern
- ✅ AutoMapper for object mapping

## 🛠️ Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| .NET | 8.0 | Framework |
| Entity Framework Core | 8.0 | ORM |
| SQL Server | 2019+ | Database |
| AutoMapper | 12.0.1 | Object Mapping |
| JWT Bearer | 8.0.0 | Authentication |
| BCrypt | Latest | Password Hashing |
| Swagger | 6.4.0 | API Documentation |
| Docker | Latest | Containerization |

## 🚀 Getting Started

### Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [SQL Server](https://www.microsoft.com/sql-server) (LocalDB or full instance)
- [Visual Studio 2022](https://visualstudio.microsoft.com/) or [VS Code](https://code.visualstudio.com/)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/NoSmokeJourney.git
cd NoSmokeJourney
```

2. **Update connection string**
Edit `NoSmokeJourney.API/appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=NoSmokeJourneyDB;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

3. **Update JWT Secret**
Generate a strong secret (at least 32 characters) and update:
```json
"JwtSettings": {
  "SecretKey": "YourSuperSecretKeyHereMakeItAtLeast32CharactersLong!"
}
```

4. **Restore packages**
```bash
dotnet restore
```

5. **Build the solution**
```bash
dotnet build
```

6. **Run migrations**
```bash
cd NoSmokeJourney.API
dotnet ef database update --project ../NoSmokeJourney.Infrastructure
```

7. **Run the application**
```bash
dotnet run
```

8. **Access Swagger UI**
```
https://localhost:5001/swagger
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Access the API
http://localhost:5000
```

## 📖 API Documentation

### Authentication Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | User login | ❌ |
| POST | `/api/auth/refresh` | Refresh token | ❌ |
| POST | `/api/auth/logout` | Logout | ✅ |

### User Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users` | Get all users | ✅ Admin |
| GET | `/api/users/{id}` | Get user by ID | ✅ |
| PUT | `/api/users/{id}` | Update user | ✅ |
| DELETE | `/api/users/{id}` | Delete user | ✅ Admin |
| POST | `/api/users/change-password` | Change password | ✅ |

### Health Tools Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/addictiontests/smoker/{id}` | Take addiction test | ✅ |
| POST | `/api/cancerrisk/smoker/{id}/assess` | Assess cancer risk | ✅ |
| GET | `/api/progresstracker/smoker/{id}` | Get progress | ✅ |
| GET | `/api/progresstracker/smoker/{id}/timeline` | Get quit timeline | ✅ |

### Doctor Directory Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/doctors` | Get all doctors | ❌ |
| GET | `/api/doctors/{id}` | Get doctor by ID | ❌ |
| GET | `/api/doctors/filter` | Filter doctors | ❌ |
| POST | `/api/doctors` | Create doctor | ✅ Admin |
| GET | `/api/medicalcenters/nearby` | Get nearby centers | ❌ |

For complete API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## 📁 Project Structure

```
NoSmokeJourney/
├── NoSmokeJourney.API/              # Presentation Layer
│   ├── Controllers/                 # API Controllers
│   ├── Middleware/                  # Custom Middleware
│   ├── appsettings.json             # Configuration
│   └── Program.cs                   # Entry Point
│
├── NoSmokeJourney.Services/         # Business Logic Layer
│   ├── DTOs/                        # Data Transfer Objects
│   ├── Interfaces/                  # Service Interfaces
│   ├── Implementations/             # Service Implementations
│   └── Mappings/                    # AutoMapper Profiles
│
├── NoSmokeJourney.Infrastructure/   # Data Access Layer
│   ├── Data/                        # DbContext
│   │   └── Seed/                    # Database Seeding
│   └── Repositories/                # Repository Implementations
│
├── NoSmokeJourney.Core/             # Domain Layer
│   ├── Entities/                    # Domain Entities
│   ├── Enums/                       # Enumerations
│   └── Interfaces/                  # Repository Interfaces
│
├── Postman/                         # Postman Collection
├── docker-compose.yml               # Docker Configuration
└── README.md                        # This file
```

## 📊 Database Schema

The database includes 13 main tables:
- **Users** - User accounts
- **Smokers** - Smoker profiles
- **Doctors** - Doctor profiles
- **MedicalCenters** - Healthcare facilities
- **Seminars** - Awareness events
- **RecoveryStories** - Community stories
- **AddictionTests** - Test results
- **CancerRiskAssessments** - Risk evaluations
- **ProgressTrackers** - Quit journey tracking
- **EducationalContents** - Articles and videos
- **HealthMilestones** - Recovery milestones

## 🔒 Security Features

- ✅ JWT Authentication
- ✅ Role-based Authorization
- ✅ BCrypt Password Hashing
- ✅ HTTPS Enforcement
- ✅ CORS Configuration
- ✅ Input Validation
- ✅ SQL Injection Protection (EF Core)

## 🧪 Testing

```bash
# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

## 🐳 Docker Support

```bash
# Build image
docker build -t nosmokejourney-api -f NoSmokeJourney.API/Dockerfile .

# Run with compose
docker-compose up -d

# View logs
docker-compose logs -f api
```

## 📦 Postman Collection

Import the Postman collection from `Postman/NoSmokeJourney_API_Collection.json` for easy API testing.

## 📚 Documentation

- [API Documentation](API_DOCUMENTATION.md) - Complete API reference
- [Architecture Guide](ARCHITECTURE.md) - Architecture and design patterns
- [Deployment Guide](DEPLOYMENT.md) - Deployment instructions
- [Contributing Guide](CONTRIBUTING.md) - How to contribute

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Fagerström Test](https://www.mdcalc.com/calc/1004/fagerstrom-test-nicotine-dependence) for addiction assessment
- [American Cancer Society](https://www.cancer.org/) for health milestone information

## 📞 Support

For support, email support@nosmokejourney.com or join our Slack channel.

## 🗺️ Roadmap

- [ ] Email notifications
- [ ] Push notifications
- [ ] AI-powered chatbot
- [ ] Mobile app integration
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Social media integration

---

<p align="center">Made with ❤️ for a smoke-free world</p>
