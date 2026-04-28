using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthMilestonesController : ControllerBase
{
    private readonly IHealthMilestoneService _healthMilestoneService;

    public HealthMilestonesController(IHealthMilestoneService healthMilestoneService)
    {
        _healthMilestoneService = healthMilestoneService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var response = await _healthMilestoneService.GetAllAsync();
        return Ok(response);
    }

    [HttpGet("active")]
    [AllowAnonymous]
    public async Task<IActionResult> GetActive()
    {
        var response = await _healthMilestoneService.GetActiveAsync();
        return Ok(response);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var response = await _healthMilestoneService.GetByIdAsync(id);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] HealthMilestoneCreateDto dto)
    {
        var response = await _healthMilestoneService.CreateAsync(dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] HealthMilestoneUpdateDto dto)
    {
        var response = await _healthMilestoneService.UpdateAsync(id, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var response = await _healthMilestoneService.DeleteAsync(id);
        return response.Success ? Ok(response) : BadRequest(response);
    }
}
