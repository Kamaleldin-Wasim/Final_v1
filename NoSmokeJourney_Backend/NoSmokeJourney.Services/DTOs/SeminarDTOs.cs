namespace NoSmokeJourney.Services.DTOs;

// Seminar Response
public class SeminarDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public TimeSpan Time { get; set; }
    public string Location { get; set; } = string.Empty;
    public string Speaker { get; set; } = string.Empty;
    public int MaxAttendees { get; set; }
    public int CurrentAttendees { get; set; }
    public int AvailableSeats => MaxAttendees - CurrentAttendees;
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
}

// Create Seminar
public class SeminarCreateDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public TimeSpan Time { get; set; }
    public string Location { get; set; } = string.Empty;
    public string Speaker { get; set; } = string.Empty;
    public int MaxAttendees { get; set; }
    public string? ImageUrl { get; set; }
}

// Update Seminar
public class SeminarUpdateDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public TimeSpan Time { get; set; }
    public string Location { get; set; } = string.Empty;
    public string Speaker { get; set; } = string.Empty;
    public int MaxAttendees { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
}

// Seminar Registration
public class SeminarRegistrationDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int SeminarId { get; set; }
    public string SeminarTitle { get; set; } = string.Empty;
    public DateTime RegistrationDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

// Register for Seminar
public class RegisterForSeminarDto
{
    public int SeminarId { get; set; }
    public string? Notes { get; set; }
}
