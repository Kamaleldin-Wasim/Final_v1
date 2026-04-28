using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MedicalCentersController : ControllerBase
{
    private readonly IMedicalCenterService _medicalCenterService;

    public MedicalCentersController(IMedicalCenterService medicalCenterService)
    {
        _medicalCenterService = medicalCenterService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] PaginationParams? paginationParams)
    {
        if (paginationParams != null)
        {
            var pagedResponse = await _medicalCenterService.GetPagedAsync(paginationParams);
            return Ok(pagedResponse);
        }

        var response = await _medicalCenterService.GetAllAsync();
        return Ok(response);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var response = await _medicalCenterService.GetByIdAsync(id);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpGet("nearby")]
    [AllowAnonymous]
    public async Task<IActionResult> GetNearby(
        [FromQuery] double latitude,
        [FromQuery] double longitude,
        [FromQuery] double radiusKm = 10)
    {
        var response = await _medicalCenterService.GetNearbyAsync(latitude, longitude, radiusKm);
        return Ok(response);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] MedicalCenterCreateDto dto)
    {
        var response = await _medicalCenterService.CreateAsync(dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] MedicalCenterUpdateDto dto)
    {
        var response = await _medicalCenterService.UpdateAsync(id, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var response = await _medicalCenterService.DeleteAsync(id);
        return response.Success ? Ok(response) : BadRequest(response);
    }
}
