namespace NoSmokeJourney.Services.DTOs;

// Health Milestone Response
public class HealthMilestoneDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TimeSpan TimeAfterQuit { get; set; }
    public string TimeAfterQuitText { get; set; } = string.Empty;
    public string? IconUrl { get; set; }
    public string? Benefits { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}

// Create Health Milestone
public class HealthMilestoneCreateDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TimeSpan TimeAfterQuit { get; set; }
    public string? IconUrl { get; set; }
    public string? Benefits { get; set; }
    public int DisplayOrder { get; set; }
}

// Update Health Milestone
public class HealthMilestoneUpdateDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TimeSpan TimeAfterQuit { get; set; }
    public string? IconUrl { get; set; }
    public string? Benefits { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}

// Quit Timeline Response
public class QuitTimelineDto
{
    public DateTime QuitDate { get; set; }
    public int SmokeFreeDays { get; set; }
    public List<TimelineMilestoneDto> Timeline { get; set; } = new();
}

// Timeline Milestone
public class TimelineMilestoneDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string TimeAfterQuit { get; set; } = string.Empty;
    public bool IsAchieved { get; set; }
    public DateTime? TargetDate { get; set; }
    public DateTime? AchievedDate { get; set; }
    public string? IconUrl { get; set; }
    public string? Benefits { get; set; }
}
