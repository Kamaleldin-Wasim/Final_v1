using NoSmokeJourney.Core.Enums;

namespace NoSmokeJourney.Services.DTOs;

// Addiction Test Request (Fagerström Test)
public class AddictionTestRequestDto
{
    // How soon after waking do you smoke? (0-3)
    public int Question1Score { get; set; }
    // Do you find it difficult to refrain from smoking? (0-1)
    public int Question2Score { get; set; }
    // Which cigarette would you hate most to give up? (0-1)
    public int Question3Score { get; set; }
    // How many cigarettes/day do you smoke? (0-3)
    public int Question4Score { get; set; }
    // Do you smoke more frequently in the morning? (0-1)
    public int Question5Score { get; set; }
    // Do you smoke when ill? (0-1)
    public int Question6Score { get; set; }
}

// Addiction Test Response
public class AddictionTestResponseDto
{
    public int Id { get; set; }
    public int SmokerId { get; set; }
    public int TotalScore { get; set; }
    public AddictionLevel AddictionLevel { get; set; }
    public string AddictionLevelText => AddictionLevel.ToString();
    public string? Advice { get; set; }
    public DateTime TestDate { get; set; }
}

// Test History
public class AddictionTestHistoryDto
{
    public int Id { get; set; }
    public int TotalScore { get; set; }
    public string AddictionLevel { get; set; } = string.Empty;
    public DateTime TestDate { get; set; }
}
