namespace NoSmokeJourney.Services.DTOs;

// Doctor Review Response
public class DoctorReviewDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime ReviewDate { get; set; }
}

// Create Review
public class DoctorReviewCreateDto
{
    public int DoctorId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}

// Update Review
public class DoctorReviewUpdateDto
{
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}
