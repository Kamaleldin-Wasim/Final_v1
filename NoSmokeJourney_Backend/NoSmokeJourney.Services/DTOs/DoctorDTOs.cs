namespace NoSmokeJourney.Services.DTOs;

// Doctor Response
public class DoctorDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public double Rating { get; set; }
    public string Location { get; set; } = string.Empty;
    public string ContactInfo { get; set; } = string.Empty;
    public string? About { get; set; }
    public string? ImageUrl { get; set; }
    public int? MedicalCenterId { get; set; }
    public string? MedicalCenterName { get; set; }
    public int ReviewCount { get; set; }
}

// Create Doctor
public class DoctorCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string ContactInfo { get; set; } = string.Empty;
    public string? About { get; set; }
    public string? ImageUrl { get; set; }
    public int? MedicalCenterId { get; set; }
}

// Update Doctor
public class DoctorUpdateDto
{
    public string Specialization { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string ContactInfo { get; set; } = string.Empty;
    public string? About { get; set; }
    public string? ImageUrl { get; set; }
    public int? MedicalCenterId { get; set; }
}

// Doctor Filter
public class DoctorFilterDto
{
    public string? Location { get; set; }
    public string? Specialization { get; set; }
    public double? MinRating { get; set; }
}
