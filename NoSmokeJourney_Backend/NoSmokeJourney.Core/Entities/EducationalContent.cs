using NoSmokeJourney.Core.Enums;

namespace NoSmokeJourney.Core.Entities;

public class EducationalContent : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ContentType Type { get; set; }
    public string ContentUrl { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string? BodyOrgan { get; set; } // For interactive body model
    public int ViewCount { get; set; }
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }
}
