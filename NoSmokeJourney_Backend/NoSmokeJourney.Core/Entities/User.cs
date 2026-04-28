using NoSmokeJourney.Core.Enums;

namespace NoSmokeJourney.Core.Entities;

public class User : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;
    public string? PhoneNumber { get; set; }
    public string? ProfileImage { get; set; }
    public bool IsActive { get; set; } = true;
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }

    // Navigation properties
    public Smoker? SmokerProfile { get; set; }
    public Doctor? DoctorProfile { get; set; }
    public ICollection<RecoveryStory> RecoveryStories { get; set; } = new List<RecoveryStory>();
    public ICollection<DoctorReview> DoctorReviews { get; set; } = new List<DoctorReview>();
    public ICollection<SeminarRegistration> SeminarRegistrations { get; set; } = new List<SeminarRegistration>();
}
