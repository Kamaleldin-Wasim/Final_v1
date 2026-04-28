namespace NoSmokeJourney.Core.Entities;

public class Doctor : BaseEntity
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public string Specialization { get; set; } = string.Empty;
    public double Rating { get; set; }
    public string Location { get; set; } = string.Empty;
    public string ContactInfo { get; set; } = string.Empty;
    public string? About { get; set; }
    public string? ImageUrl { get; set; }
    public int? MedicalCenterId { get; set; }
    public MedicalCenter? MedicalCenter { get; set; }

    // Navigation properties
    public ICollection<DoctorReview> Reviews { get; set; } = new List<DoctorReview>();
}
