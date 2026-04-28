using NoSmokeJourney.Core.Enums;

namespace NoSmokeJourney.Core.Entities;

public class RecoveryStory : BaseEntity
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public StoryStatus Status { get; set; } = StoryStatus.Pending;
    public string? RejectionReason { get; set; }
    public DateTime? PublishedAt { get; set; }
    public int ViewCount { get; set; }

    // Navigation properties
    public int? ApprovedByAdminId { get; set; }
}
