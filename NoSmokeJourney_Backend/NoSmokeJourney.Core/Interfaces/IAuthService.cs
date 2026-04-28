using NoSmokeJourney.Core.Entities;

namespace NoSmokeJourney.Core.Interfaces;

public interface IAuthcoreService
{
    Task<string> GenerateJwtToken(User user);
    Task<string> GenerateRefreshToken();
    Task<(string token, string refreshToken)> AuthenticateAsync(string email, string password);
    Task<(string token, string refreshToken)> RefreshTokenAsync(string token, string refreshToken);
    Task<bool> RevokeTokenAsync(string email);
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
}
