using NoSmokeJourney.Core.Enums;

namespace NoSmokeJourney.Core.Entities;

public class SeminarRegistration : BaseEntity
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int SeminarId { get; set; }
    public Seminar Seminar { get; set; } = null!;

    public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;
    public RegistrationStatus Status { get; set; } = RegistrationStatus.Pending;
    public string? Notes { get; set; }
}
