namespace NoSmokeJourney.Services.DTOs;

// Progress Tracker Response
public class ProgressTrackerDto
{
    public int Id { get; set; }
    public int SmokerId { get; set; }
    public DateTime QuitDate { get; set; }
    public int SmokeFreeDays { get; set; }
    public int CigarettesAvoided { get; set; }
    public double MoneySaved { get; set; }
    public int HealthTimeRegained { get; set; }
    public int? HealthAge { get; set; }

    // Milestones
    public List<MilestoneDto> AchievedMilestones { get; set; } = new();
    public List<MilestoneDto> UpcomingMilestones { get; set; } = new();

    public DateTime LastUpdated { get; set; }
}

// Milestone DTO
public class MilestoneDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TimeSpan TimeAfterQuit { get; set; }
    public string? IconUrl { get; set; }
    public bool IsAchieved { get; set; }
    public DateTime? AchievedAt { get; set; }
}

// Update Progress
public class ProgressUpdateDto
{
    public int CigarettesAvoided { get; set; }
    public double MoneySaved { get; set; }
    public int HealthTimeRegained { get; set; }
}

// Health Age Calculation
public class HealthAgeDto
{
    public int ActualAge { get; set; }
    public int HealthAge { get; set; }
    public int AgeDifference => ActualAge - HealthAge;
    public string Message { get; set; } = string.Empty;
}
