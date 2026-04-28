using NoSmokeJourney.Core.Enums;

namespace NoSmokeJourney.Services.DTOs;

// Cancer Risk Assessment Request
public class CancerRiskRequestDto
{
    public int Age { get; set; }
    public int CigarettesPerDay { get; set; }
    public int YearsOfSmoking { get; set; }
    public bool HasFamilyHistory { get; set; }
    public bool HasPersistentCough { get; set; }
    public bool HasChestPain { get; set; }
    public bool HasShortnessOfBreath { get; set; }
    public bool HasBloodInCough { get; set; }
    public bool HasUnexplainedWeightLoss { get; set; }
}

// Cancer Risk Assessment Response
public class CancerRiskResponseDto
{
    public int Id { get; set; }
    public int SmokerId { get; set; }
    public RiskLevel RiskLevel { get; set; }
    public string RiskLevelText => RiskLevel.ToString();
    public double RiskPercentage { get; set; }
    public string Recommendations { get; set; } = string.Empty;
    public DateTime AssessmentDate { get; set; }
}

// Risk Assessment History
public class CancerRiskHistoryDto
{
    public int Id { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
    public double RiskPercentage { get; set; }
    public DateTime AssessmentDate { get; set; }
}
