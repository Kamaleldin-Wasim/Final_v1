using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll([FromQuery] PaginationParams? paginationParams)
    {
        if (paginationParams != null)
        {
            var pagedResponse = await _userService.GetPagedAsync(paginationParams);
            return Ok(pagedResponse);
        }

        var response = await _userService.GetAllAsync();
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var response = await _userService.GetByIdAsync(id);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpGet("email/{email}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetByEmail(string email)
    {
        var response = await _userService.GetByEmailAsync(email);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UserUpdateDto dto)
    {
        var response = await _userService.UpdateAsync(id, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var response = await _userService.DeleteAsync(id);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("complete-profile")]
    public async Task<IActionResult> CompleteProfile([FromBody] UserProfileCompleteDto dto)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var response = await _userService.CompleteProfileAsync(userId, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var response = await _userService.ChangePasswordAsync(userId, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }
}
