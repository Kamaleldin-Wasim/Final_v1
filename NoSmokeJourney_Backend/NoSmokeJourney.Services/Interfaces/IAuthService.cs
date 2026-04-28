using NoSmokeJourney.Services.DTOs;

namespace NoSmokeJourney.Services.Interfaces;

public interface IAuthService
{
    Task<ApiResponse<AuthResponseDto>> RegisterAsync(UserRegisterDto dto);
    Task<ApiResponse<AuthResponseDto>> LoginAsync(UserLoginDto dto);
    Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(string token, string refreshToken);
    Task<ApiResponse<bool>> LogoutAsync(int userId);
}
