namespace NoSmokeJourney.Core.Entities;

public class Seminar : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public TimeSpan Time { get; set; }
    public string Location { get; set; } = string.Empty;
    public string Speaker { get; set; } = string.Empty;
    public int MaxAttendees { get; set; }
    public int CurrentAttendees { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<SeminarRegistration> Registrations { get; set; } = new List<SeminarRegistration>();
}
