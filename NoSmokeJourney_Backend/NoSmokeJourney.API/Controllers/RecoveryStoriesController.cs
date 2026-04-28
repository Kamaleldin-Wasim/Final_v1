using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

using NoSmokeJourney.Core.Enums;

namespace NoSmokeJourney.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecoveryStoriesController : ControllerBase
{
    private readonly IRecoveryStoryService _recoveryStoryService;

    public RecoveryStoriesController(IRecoveryStoryService recoveryStoryService)
    {
        _recoveryStoryService = recoveryStoryService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] PaginationParams paginationParams, [FromQuery] StoryStatus? status)
    {
        var response = await _recoveryStoryService.GetPagedAsync(paginationParams, status);
        return Ok(response);
    }

    [HttpGet("approved")]
    [AllowAnonymous]
    public async Task<IActionResult> GetApproved()
    {
        var response = await _recoveryStoryService.GetApprovedAsync();
        return Ok(response);
    }

    [HttpGet("pending")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPending()
    {
        var response = await _recoveryStoryService.GetPendingAsync();
        return Ok(response);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var response = await _recoveryStoryService.GetByIdAsync(id);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] RecoveryStoryCreateDto dto)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var response = await _recoveryStoryService.CreateAsync(userId, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] RecoveryStoryUpdateDto dto)
    {
        var response = await _recoveryStoryService.UpdateAsync(id, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var response = await _recoveryStoryService.DeleteAsync(id);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("{id}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Approve(int id)
    {
        var adminId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var response = await _recoveryStoryService.ApproveAsync(id, adminId);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("{id}/reject")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Reject(int id, [FromBody] RejectStoryRequestDto dto)
    {
        var response = await _recoveryStoryService.RejectAsync(id, dto.Reason);
        return response.Success ? Ok(response) : BadRequest(response);
    }
}

public class RejectStoryRequestDto
{
    public string Reason { get; set; } = string.Empty;
}
