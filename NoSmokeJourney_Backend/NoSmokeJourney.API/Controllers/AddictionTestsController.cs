using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AddictionTestsController : ControllerBase
{
    private readonly IAddictionTestService _addictionTestService;

    public AddictionTestsController(IAddictionTestService addictionTestService)
    {
        _addictionTestService = addictionTestService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var response = await _addictionTestService.GetByIdAsync(id);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpGet("smoker/{smokerId}/history")]
    public async Task<IActionResult> GetHistory(int smokerId)
    {
        var response = await _addictionTestService.GetHistoryBySmokerIdAsync(smokerId);
        return Ok(response);
    }

    [HttpGet("smoker/{smokerId}/latest")]
    public async Task<IActionResult> GetLatest(int smokerId)
    {
        var response = await _addictionTestService.GetLatestBySmokerIdAsync(smokerId);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpPost("take-test")]
    public async Task<IActionResult> TakeTestForCurrentUser([FromBody] AddictionTestRequestDto dto)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var response = await _addictionTestService.TakeTestByUserIdAsync(userId, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("smoker/{smokerId}")]
    public async Task<IActionResult> TakeTest(int smokerId, [FromBody] AddictionTestRequestDto dto)
    {
        var response = await _addictionTestService.TakeTestAsync(smokerId, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }
}
