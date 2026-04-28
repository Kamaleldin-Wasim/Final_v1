namespace NoSmokeJourney.Services.DTOs;

// Medical Center Response
public class MedicalCenterDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string ContactInfo { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int DoctorCount { get; set; }
}

// Create Medical Center
public class MedicalCenterCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string ContactInfo { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}

// Update Medical Center
public class MedicalCenterUpdateDto
{
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string ContactInfo { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}
