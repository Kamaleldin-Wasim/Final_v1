using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly IDoctorService _doctorService;

    public DoctorsController(IDoctorService doctorService)
    {
        _doctorService = doctorService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] PaginationParams? paginationParams)
    {
        if (paginationParams != null)
        {
            var pagedResponse = await _doctorService.GetPagedAsync(paginationParams);
            return Ok(pagedResponse);
        }

        var response = await _doctorService.GetAllAsync();
        return Ok(response);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var response = await _doctorService.GetByIdAsync(id);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpGet("filter")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByFilter([FromQuery] DoctorFilterDto filter)
    {
        var response = await _doctorService.GetByFilterAsync(filter);
        return Ok(response);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] DoctorCreateDto dto)
    {
        var response = await _doctorService.CreateAsync(dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] DoctorUpdateDto dto)
    {
        var response = await _doctorService.UpdateAsync(id, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var response = await _doctorService.DeleteAsync(id);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpGet("{id}/rating")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAverageRating(int id)
    {
        var response = await _doctorService.GetAverageRatingAsync(id);
        return Ok(response);
    }
}
