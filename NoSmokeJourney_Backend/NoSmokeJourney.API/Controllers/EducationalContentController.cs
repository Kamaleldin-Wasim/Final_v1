using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EducationalContentController : ControllerBase
{
    private readonly IEducationalContentService _educationalContentService;

    public EducationalContentController(IEducationalContentService educationalContentService)
    {
        _educationalContentService = educationalContentService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] PaginationParams? paginationParams)
    {
        if (paginationParams != null)
        {
            var pagedResponse = await _educationalContentService.GetPagedAsync(paginationParams);
            return Ok(pagedResponse);
        }

        var response = await _educationalContentService.GetAllAsync();
        return Ok(response);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var response = await _educationalContentService.GetByIdAsync(id);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpGet("type/{type}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByType(string type)
    {
        var response = await _educationalContentService.GetByTypeAsync(type);
        return Ok(response);
    }

    [HttpGet("organ/{bodyOrgan}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByBodyOrgan(string bodyOrgan)
    {
        var response = await _educationalContentService.GetByBodyOrganAsync(bodyOrgan);
        return Ok(response);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] EducationalContentCreateDto dto)
    {
        var response = await _educationalContentService.CreateAsync(dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] EducationalContentUpdateDto dto)
    {
        var response = await _educationalContentService.UpdateAsync(id, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var response = await _educationalContentService.DeleteAsync(id);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("{id}/view")]
    [AllowAnonymous]
    public async Task<IActionResult> IncrementViewCount(int id)
    {
        var response = await _educationalContentService.IncrementViewCountAsync(id);
        return response.Success ? Ok(response) : BadRequest(response);
    }
}
