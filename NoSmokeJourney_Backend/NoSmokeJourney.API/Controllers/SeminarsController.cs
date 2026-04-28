using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeminarsController : ControllerBase
{
    private readonly ISeminarService _seminarService;

    public SeminarsController(ISeminarService seminarService)
    {
        _seminarService = seminarService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] PaginationParams? paginationParams)
    {
        if (paginationParams != null)
        {
            var pagedResponse = await _seminarService.GetPagedAsync(paginationParams);
            return Ok(pagedResponse);
        }

        var response = await _seminarService.GetAllAsync();
        return Ok(response);
    }

    [HttpGet("upcoming")]
    [AllowAnonymous]
    public async Task<IActionResult> GetUpcoming()
    {
        var response = await _seminarService.GetUpcomingAsync();
        return Ok(response);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var response = await _seminarService.GetByIdAsync(id);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] SeminarCreateDto dto)
    {
        var response = await _seminarService.CreateAsync(dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] SeminarUpdateDto dto)
    {
        var response = await _seminarService.UpdateAsync(id, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var response = await _seminarService.DeleteAsync(id);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("register")]
    [Authorize]
    public async Task<IActionResult> Register([FromBody] RegisterForSeminarDto dto)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var response = await _seminarService.RegisterAsync(userId, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("cancel/{registrationId}")]
    [Authorize]
    public async Task<IActionResult> CancelRegistration(int registrationId)
    {
        var response = await _seminarService.CancelRegistrationAsync(registrationId);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpGet("my-registrations")]
    [Authorize]
    public async Task<IActionResult> GetMyRegistrations()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var response = await _seminarService.GetUserRegistrationsAsync(userId);
        return Ok(response);
    }
}
