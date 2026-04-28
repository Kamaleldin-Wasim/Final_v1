using NoSmokeJourney.Core.Enums;

namespace NoSmokeJourney.Services.DTOs;

// User Registration
public class UserRegisterDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
}

// User Login
public class UserLoginDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

// User Response
public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string? PhoneNumber { get; set; }
    public string? ProfileImage { get; set; }
    public DateTime CreatedAt { get; set; }
}

// User Update
public class UserUpdateDto
{
    public string Name { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? ProfileImage { get; set; }
}

// Change Password
public class ChangePasswordDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

// Auth Response
public class AuthResponseDto
{
    public UserDto User { get; set; } = null!;
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public class UserProfileCompleteDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int Age { get; set; }
    public Gender Gender { get; set; }
    public int CigarettesPerDay { get; set; }
    public int YearsOfSmoking { get; set; }
    public string? MedicalHistory { get; set; }
    public string? FamilyDiseases { get; set; }
    public int? QuitAttempts { get; set; }
}
