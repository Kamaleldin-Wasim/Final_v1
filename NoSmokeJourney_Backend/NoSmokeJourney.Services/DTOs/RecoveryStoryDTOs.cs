namespace NoSmokeJourney.Services.DTOs;

// Recovery Story Response
public class RecoveryStoryDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? PublishedAt { get; set; }
    public int ViewCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Create Recovery Story
public class RecoveryStoryCreateDto
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
}

// Update Recovery Story
public class RecoveryStoryUpdateDto
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
}

// Approve/Reject Story (Admin)
public class StoryModerationDto
{
    public int StoryId { get; set; }
    public bool IsApproved { get; set; }
    public string? RejectionReason { get; set; }
}
