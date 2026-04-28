using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CancerRiskController : ControllerBase
{
    private readonly ICancerRiskService _cancerRiskService;

    public CancerRiskController(ICancerRiskService cancerRiskService)
    {
        _cancerRiskService = cancerRiskService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var response = await _cancerRiskService.GetByIdAsync(id);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpGet("smoker/{smokerId}/history")]
    public async Task<IActionResult> GetHistory(int smokerId)
    {
        var response = await _cancerRiskService.GetHistoryBySmokerIdAsync(smokerId);
        return Ok(response);
    }

    [HttpGet("smoker/{smokerId}/latest")]
    public async Task<IActionResult> GetLatest(int smokerId)
    {
        var response = await _cancerRiskService.GetLatestBySmokerIdAsync(smokerId);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpPost("smoker/{smokerId}/assess")]
    public async Task<IActionResult> AssessRisk(int smokerId, [FromBody] CancerRiskRequestDto dto)
    {
        var response = await _cancerRiskService.AssessRiskAsync(smokerId, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }
}
