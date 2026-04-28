using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProgressTrackerController : ControllerBase
{
    private readonly IProgressTrackerService _progressTrackerService;

    public ProgressTrackerController(IProgressTrackerService progressTrackerService)
    {
        _progressTrackerService = progressTrackerService;
    }

    [HttpGet("current")]
    public async Task<IActionResult> GetForCurrentUser()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var response = await _progressTrackerService.GetByUserIdAsync(userId);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpGet("smoker/{smokerId}")]
    public async Task<IActionResult> GetBySmokerId(int smokerId)
    {
        var response = await _progressTrackerService.GetBySmokerIdAsync(smokerId);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpPost("smoker/{smokerId}/initialize")]
    public async Task<IActionResult> Initialize(int smokerId, [FromBody] InitializeTrackerDto dto)
    {
        var response = await _progressTrackerService.InitializeAsync(smokerId, dto.QuitDate);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPut("smoker/{smokerId}/update")]
    public async Task<IActionResult> UpdateProgress(int smokerId, [FromBody] ProgressUpdateDto dto)
    {
        var response = await _progressTrackerService.UpdateProgressAsync(smokerId, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpGet("smoker/{smokerId}/health-age")]
    public async Task<IActionResult> CalculateHealthAge(int smokerId)
    {
        var response = await _progressTrackerService.CalculateHealthAgeAsync(smokerId);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpGet("smoker/{smokerId}/timeline")]
    public async Task<IActionResult> GetQuitTimeline(int smokerId)
    {
        var response = await _progressTrackerService.GetQuitTimelineAsync(smokerId);
        return response.Success ? Ok(response) : BadRequest(response);
    }
}

public class InitializeTrackerDto
{
    public DateTime QuitDate { get; set; }
}
