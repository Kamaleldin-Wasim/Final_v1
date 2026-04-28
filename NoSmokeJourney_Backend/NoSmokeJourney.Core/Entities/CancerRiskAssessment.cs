using NoSmokeJourney.Core.Enums;

namespace NoSmokeJourney.Core.Entities;

public class CancerRiskAssessment : BaseEntity
{
    public int SmokerId { get; set; }
    public Smoker Smoker { get; set; } = null!;

    public int Age { get; set; }
    public int CigarettesPerDay { get; set; }
    public int YearsOfSmoking { get; set; }
    public bool HasFamilyHistory { get; set; }
    public bool HasPersistentCough { get; set; }
    public bool HasChestPain { get; set; }
    public bool HasShortnessOfBreath { get; set; }
    public bool HasBloodInCough { get; set; }
    public bool HasUnexplainedWeightLoss { get; set; }

    public RiskLevel RiskLevel { get; set; }
    public double RiskPercentage { get; set; }
    public string Recommendations { get; set; } = string.Empty;
    public DateTime AssessmentDate { get; set; } = DateTime.UtcNow;
}
