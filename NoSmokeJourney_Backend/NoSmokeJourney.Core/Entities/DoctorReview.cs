namespace NoSmokeJourney.Core.Entities;

public class DoctorReview : BaseEntity
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int DoctorId { get; set; }
    public Doctor Doctor { get; set; } = null!;

    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime ReviewDate { get; set; } = DateTime.UtcNow;
    public bool IsVisible { get; set; } = true;
}
