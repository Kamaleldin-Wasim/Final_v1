using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SmokersController : ControllerBase
{
    private readonly ISmokerService _smokerService;

    public SmokersController(ISmokerService smokerService)
    {
        _smokerService = smokerService;
    }

    [HttpGet("current")]
    public async Task<IActionResult> GetCurrent()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var response = await _smokerService.GetByUserIdAsync(userId);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var response = await _smokerService.GetByIdAsync(id);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        var response = await _smokerService.GetByUserIdAsync(userId);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpPost("user/{userId}")]
    public async Task<IActionResult> Create(int userId, [FromBody] SmokerCreateDto dto)
    {
        var response = await _smokerService.CreateAsync(userId, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] SmokerUpdateDto dto)
    {
        var response = await _smokerService.UpdateAsync(id, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var response = await _smokerService.DeleteAsync(id);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("quit-date")]
    public async Task<IActionResult> SetQuitDateForCurrentUser([FromBody] SetQuitDateDto dto)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var smokerResponse = await _smokerService.GetByUserIdAsync(userId);
        if (!smokerResponse.Success || smokerResponse.Data == null)
            return NotFound(smokerResponse);

        var response = await _smokerService.SetQuitDateAsync(smokerResponse.Data.Id, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("{smokerId}/quit-date")]
    public async Task<IActionResult> SetQuitDate(int smokerId, [FromBody] SetQuitDateDto dto)
    {
        var response = await _smokerService.SetQuitDateAsync(smokerId, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }
}
