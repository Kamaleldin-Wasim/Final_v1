namespace NoSmokeJourney.Core.Entities;

public class HealthMilestone : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TimeSpan TimeAfterQuit { get; set; }
    public string? IconUrl { get; set; }
    public string? Benefits { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
