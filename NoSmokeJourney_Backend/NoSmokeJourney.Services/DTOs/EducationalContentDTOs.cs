using NoSmokeJourney.Core.Enums;

namespace NoSmokeJourney.Services.DTOs;

// Educational Content Response
public class EducationalContentDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ContentType Type { get; set; }
    public string TypeText => Type.ToString();
    public string ContentUrl { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string? BodyOrgan { get; set; }
    public int ViewCount { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Create Educational Content
public class EducationalContentCreateDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ContentType Type { get; set; }
    public string ContentUrl { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string? BodyOrgan { get; set; }
    public int DisplayOrder { get; set; }
}

// Update Educational Content
public class EducationalContentUpdateDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ContentType Type { get; set; }
    public string ContentUrl { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string? BodyOrgan { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}

// Content Filter
public class ContentFilterDto
{
    public ContentType? Type { get; set; }
    public string? BodyOrgan { get; set; }
}
