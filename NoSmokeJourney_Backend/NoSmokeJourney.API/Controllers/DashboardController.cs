using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NoSmokeJourney.Core.Enums;
using NoSmokeJourney.Infrastructure.Data;
using NoSmokeJourney.Services.DTOs;

namespace NoSmokeJourney.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = new DashboardStatsDto
        {
            StoriesSubmitted = await _context.RecoveryStories.CountAsync(s => s.Status == StoryStatus.Pending),
            TotalUsers = await _context.Users.CountAsync(u => u.Role == UserRole.User),
            ActiveDoctors = await _context.Doctors.CountAsync(),
            HospitalsLabs = await _context.MedicalCenters.CountAsync()
        };

        return Ok(ApiResponse<DashboardStatsDto>.SuccessResponse(stats));
    }
}

public class DashboardStatsDto
{
    public int StoriesSubmitted { get; set; }
    public int TotalUsers { get; set; }
    public int ActiveDoctors { get; set; }
    public int HospitalsLabs { get; set; }
}
