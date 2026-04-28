namespace NoSmokeJourney.Core.Entities;

public class MedicalCenter : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string ContactInfo { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    // Navigation properties
    public ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
}
