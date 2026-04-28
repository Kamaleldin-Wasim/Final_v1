using NoSmokeJourney.Core.Enums;

namespace NoSmokeJourney.Services.DTOs;

// Smoker Profile
public class SmokerDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int Age { get; set; }
    public Gender Gender { get; set; }
    public int CigarettesPerDay { get; set; }
    public int YearsOfSmoking { get; set; }
    public string? MedicalHistory { get; set; }
    public string? FamilyDiseases { get; set; }
    public int? PreviousQuitAttempts { get; set; }
    public DateTime? QuitDate { get; set; }
    public double? CigarettePrice { get; set; }
}

// Create/Update Smoker Profile
public class SmokerCreateDto
{
    public int Age { get; set; }
    public Gender Gender { get; set; }
    public int CigarettesPerDay { get; set; }
    public int YearsOfSmoking { get; set; }
    public string? MedicalHistory { get; set; }
    public string? FamilyDiseases { get; set; }
    public int? PreviousQuitAttempts { get; set; }
    public double? CigarettePrice { get; set; }
}

// Update Smoker Profile
public class SmokerUpdateDto
{
    public int Age { get; set; }
    public int CigarettesPerDay { get; set; }
    public int YearsOfSmoking { get; set; }
    public string? MedicalHistory { get; set; }
    public string? FamilyDiseases { get; set; }
    public int? PreviousQuitAttempts { get; set; }
    public double? CigarettePrice { get; set; }
}

// Set Quit Date
public class SetQuitDateDto
{
    public DateTime QuitDate { get; set; }
}
