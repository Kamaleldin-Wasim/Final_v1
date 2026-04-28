using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorReviewsController : ControllerBase
{
    private readonly IDoctorReviewService _doctorReviewService;

    public DoctorReviewsController(IDoctorReviewService doctorReviewService)
    {
        _doctorReviewService = doctorReviewService;
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var response = await _doctorReviewService.GetByIdAsync(id);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpGet("doctor/{doctorId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByDoctorId(int doctorId)
    {
        var response = await _doctorReviewService.GetByDoctorIdAsync(doctorId);
        return Ok(response);
    }

    [HttpGet("my-reviews")]
    [Authorize]
    public async Task<IActionResult> GetMyReviews()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var response = await _doctorReviewService.GetByUserIdAsync(userId);
        return Ok(response);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] DoctorReviewCreateDto dto)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var response = await _doctorReviewService.CreateAsync(userId, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] DoctorReviewUpdateDto dto)
    {
        var response = await _doctorReviewService.UpdateAsync(id, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var response = await _doctorReviewService.DeleteAsync(id);
        return response.Success ? Ok(response) : BadRequest(response);
    }
}
