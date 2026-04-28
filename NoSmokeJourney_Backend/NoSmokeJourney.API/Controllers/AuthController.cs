using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] UserRegisterDto dto)
    {
        var response = await _authService.RegisterAsync(dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] UserLoginDto dto)
    {
        var response = await _authService.LoginAsync(dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto dto)
    {
        var response = await _authService.RefreshTokenAsync(dto.Token, dto.RefreshToken);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
        var response = await _authService.LogoutAsync(userId);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("/api/password/request-code")]
    [AllowAnonymous]
    public IActionResult RequestPasswordReset([FromBody] PasswordResetRequestDto dto)
    {
        // MOCK IMPLEMENTATION: In a real app, send an email here.
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Password reset code sent successfully"));
    }

    [HttpPost("/api/password/verify-code")]
    [AllowAnonymous]
    public IActionResult VerifyPasswordResetCode([FromBody] PasswordResetVerifyDto dto)
    {
        // MOCK IMPLEMENTATION: Accept any code for now.
        if (string.IsNullOrWhiteSpace(dto.Code))
            return BadRequest(ApiResponse<bool>.ErrorResponse("Invalid code"));
            
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Code verified successfully"));
    }
}

public class RefreshTokenRequestDto
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
}

public class PasswordResetRequestDto
{
    public string Email { get; set; } = string.Empty;
}

public class PasswordResetVerifyDto
{
    public string Email { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}
