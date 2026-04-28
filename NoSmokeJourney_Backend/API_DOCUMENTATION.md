# No Smoke Journey API Documentation

## Base URL
```
Development: https://localhost:5001
Production: https://api.nosmokejourney.com
```

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

1. Register a new user: `POST /api/auth/register`
2. Login: `POST /api/auth/login`
3. Use the returned token in subsequent requests

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### Paged Response
```json
{
  "items": [...],
  "pageNumber": 1,
  "pageSize": 10,
  "totalCount": 100,
  "totalPages": 10,
  "hasPreviousPage": false,
  "hasNextPage": true
}
```

## Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4=",
    "expiresAt": "2024-01-01T02:00:00Z"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123!"
}
```

### Users

#### Get All Users (Admin)
```http
GET /api/users?pageNumber=1&pageSize=10
Authorization: Bearer <token>
```

#### Get User by ID
```http
GET /api/users/1
Authorization: Bearer <token>
```

#### Update User
```http
PUT /api/users/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phoneNumber": "+9876543210"
}
```

#### Change Password
```http
POST /api/users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword123!"
}
```

### Smokers

#### Create Smoker Profile
```http
POST /api/smokers/user/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "age": 35,
  "gender": 0,
  "cigarettesPerDay": 20,
  "yearsOfSmoking": 10,
  "medicalHistory": "None",
  "familyDiseases": "None",
  "previousQuitAttempts": 2,
  "cigarettePrice": 10.50
}
```

#### Set Quit Date
```http
POST /api/smokers/1/quit-date
Authorization: Bearer <token>
Content-Type: application/json

{
  "quitDate": "2024-01-01T00:00:00Z"
}
```

### Doctors

#### Get All Doctors
```http
GET /api/doctors?pageNumber=1&pageSize=10
```

#### Filter Doctors
```http
GET /api/doctors/filter?location=Cairo&specialization=Pulmonology&minRating=4
```

#### Create Doctor (Admin)
```http
POST /api/doctors
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 2,
  "specialization": "Pulmonology",
  "location": "Cairo, Egypt",
  "contactInfo": "+20123456789",
  "about": "Specialized in respiratory diseases"
}
```

### Medical Centers

#### Get Nearby Centers
```http
GET /api/medicalcenters/nearby?latitude=30.0444&longitude=31.2357&radiusKm=10
```

### Seminars

#### Get Upcoming Seminars
```http
GET /api/seminars/upcoming
```

#### Register for Seminar
```http
POST /api/seminars/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "seminarId": 1,
  "notes": "Looking forward to attending!"
}
```

### Recovery Stories

#### Get Approved Stories
```http
GET /api/recoverystories/approved?pageNumber=1&pageSize=10
```

#### Submit Story
```http
POST /api/recoverystories
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Journey to Freedom",
  "content": "After 15 years of smoking...",
  "photoUrl": "/images/story1.jpg"
}
```

#### Approve Story (Admin)
```http
POST /api/recoverystories/1/approve
Authorization: Bearer <token>
```

### Health Tools

#### Take Addiction Test
```http
POST /api/addictiontests/smoker/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "question1Score": 2,
  "question2Score": 1,
  "question3Score": 1,
  "question4Score": 2,
  "question5Score": 1,
  "question6Score": 0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test completed successfully",
  "data": {
    "id": 1,
    "smokerId": 1,
    "totalScore": 7,
    "addictionLevel": 1,
    "addictionLevelText": "Moderate",
    "advice": "Your nicotine dependence is moderate...",
    "testDate": "2024-01-01T12:00:00Z"
  }
}
```

#### Assess Cancer Risk
```http
POST /api/cancerrisk/smoker/1/assess
Authorization: Bearer <token>
Content-Type: application/json

{
  "age": 35,
  "cigarettesPerDay": 20,
  "yearsOfSmoking": 10,
  "hasFamilyHistory": false,
  "hasPersistentCough": true,
  "hasChestPain": false,
  "hasShortnessOfBreath": false,
  "hasBloodInCough": false,
  "hasUnexplainedWeightLoss": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Risk assessment completed",
  "data": {
    "id": 1,
    "smokerId": 1,
    "riskLevel": 1,
    "riskLevelText": "Medium",
    "riskPercentage": 35.5,
    "recommendations": "Your lung cancer risk is moderate...",
    "assessmentDate": "2024-01-01T12:00:00Z"
  }
}
```

#### Get Progress Tracker
```http
GET /api/progresstracker/smoker/1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "smokerId": 1,
    "quitDate": "2024-01-01T00:00:00Z",
    "smokeFreeDays": 30,
    "cigarettesAvoided": 600,
    "moneySaved": 315.0,
    "healthTimeRegained": 6600,
    "healthAge": 34,
    "achievedMilestones": [...],
    "upcomingMilestones": [...]
  }
}
```

#### Get Quit Timeline
```http
GET /api/progresstracker/smoker/1/timeline
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quitDate": "2024-01-01T00:00:00Z",
    "smokeFreeDays": 30,
    "timeline": [
      {
        "title": "20 Minutes",
        "description": "Your heart rate and blood pressure drop...",
        "timeAfterQuit": "20 minutes",
        "isAchieved": true,
        "targetDate": "2024-01-01T00:20:00Z",
        "achievedDate": "2024-01-01T00:20:00Z",
        "benefits": "Reduced risk of heart attack..."
      },
      ...
    ]
  }
}
```

### Educational Content

#### Get Content by Type
```http
GET /api/educationalcontent/type/Video
```

#### Get Content by Body Organ
```http
GET /api/educationalcontent/organ/Lungs
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## Rate Limiting

Currently, no rate limiting is implemented. This may be added in future versions.

## Pagination

All list endpoints support pagination using query parameters:
- `pageNumber`: Page number (default: 1)
- `pageSize`: Items per page (default: 10, max: 50)

Example:
```http
GET /api/doctors?pageNumber=2&pageSize=20
```

## Filtering

Some endpoints support filtering using query parameters:

### Doctors
- `location`: Filter by location
- `specialization`: Filter by specialization
- `minRating`: Minimum rating

### Educational Content
- `type`: Content type (Article, Video, Infographic)
- `bodyOrgan`: Body organ (Lungs, Heart, Brain, etc.)

## Sorting

Default sorting is by ID ascending. Custom sorting may be added in future versions.

## Caching

Currently, no caching is implemented. This may be added in future versions for performance optimization.

## Webhooks

Not currently supported. This may be added in future versions.

## SDKs

Not currently available. Community contributions are welcome!

## Support

For API support, please contact: support@nosmokejourney.com

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.
