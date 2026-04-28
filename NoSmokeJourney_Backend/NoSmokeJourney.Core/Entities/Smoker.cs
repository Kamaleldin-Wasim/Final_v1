using NoSmokeJourney.Core.Enums;

namespace NoSmokeJourney.Core.Entities;

public class Smoker : BaseEntity
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    // Personal Information
    public int Age { get; set; }
    public Gender Gender { get; set; }
    public int CigarettesPerDay { get; set; }
    public int YearsOfSmoking { get; set; }
    public string? MedicalHistory { get; set; }
    public string? FamilyDiseases { get; set; }
    public int? PreviousQuitAttempts { get; set; }

    // Quit Journey
    public DateTime? QuitDate { get; set; }
    public double? CigarettePrice { get; set; }

    // Navigation properties
    public ICollection<AddictionTest> AddictionTests { get; set; } = new List<AddictionTest>();
    public ICollection<CancerRiskAssessment> CancerRiskAssessments { get; set; } = new List<CancerRiskAssessment>();
    public ProgressTracker? ProgressTracker { get; set; }
}
