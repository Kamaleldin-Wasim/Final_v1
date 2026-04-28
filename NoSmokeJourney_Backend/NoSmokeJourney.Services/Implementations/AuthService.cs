using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using NoSmokeJourney.Core.Entities;
using NoSmokeJourney.Core.Enums;
using NoSmokeJourney.Core.Interfaces;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace NoSmokeJourney.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IConfiguration _configuration;

    public AuthService(IUnitOfWork unitOfWork, IMapper mapper, IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _configuration = configuration;
    }

    public async Task<ApiResponse<AuthResponseDto>> RegisterAsync(UserRegisterDto dto)
    {
        try
        {
            // Check if email exists
            var existingUser = await _unitOfWork.Repository<User>()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());

            if (existingUser != null)
            {
                return ApiResponse<AuthResponseDto>.ErrorResponse("Email already registered");
            }

            // Create new user
            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email.ToLower(),
                PasswordHash = HashPassword(dto.Password),
                PhoneNumber = dto.PhoneNumber,
                Role = UserRole.User,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<User>().AddAsync(user);
            await _unitOfWork.CompleteAsync();

            // Generate tokens
            var token = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _unitOfWork.CompleteAsync();

            var userDto = _mapper.Map<UserDto>(user);
            var authResponse = new AuthResponseDto
            {
                User = userDto,
                Token = token,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddHours(2)
            };

            return ApiResponse<AuthResponseDto>.SuccessResponse(authResponse, "User registered successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<AuthResponseDto>.ErrorResponse($"Registration failed: {ex.Message}");
        }
    }

    public async Task<ApiResponse<AuthResponseDto>> LoginAsync(UserLoginDto dto)
    {
        try
        {
            var user = await _unitOfWork.Repository<User>()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());

            if (user == null || !VerifyPassword(dto.Password, user.PasswordHash))
            {
                return ApiResponse<AuthResponseDto>.ErrorResponse("Invalid email or password");
            }

            if (!user.IsActive)
            {
                return ApiResponse<AuthResponseDto>.ErrorResponse("Account is deactivated");
            }

            var token = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _unitOfWork.CompleteAsync();

            var userDto = _mapper.Map<UserDto>(user);
            var authResponse = new AuthResponseDto
            {
                User = userDto,
                Token = token,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddHours(2)
            };

            return ApiResponse<AuthResponseDto>.SuccessResponse(authResponse, "Login successful");
        }
        catch (Exception ex)
        {
            return ApiResponse<AuthResponseDto>.ErrorResponse($"Login failed: {ex.Message}");
        }
    }

    public async Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(string token, string refreshToken)
    {
        try
        {
            var principal = GetPrincipalFromExpiredToken(token);
            var email = principal.FindFirst(ClaimTypes.Email)?.Value;

            var user = await _unitOfWork.Repository<User>()
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null || user.RefreshToken != refreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return ApiResponse<AuthResponseDto>.ErrorResponse("Invalid refresh token");
            }

            var newToken = GenerateJwtToken(user);
            var newRefreshToken = GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _unitOfWork.CompleteAsync();

            var userDto = _mapper.Map<UserDto>(user);
            var authResponse = new AuthResponseDto
            {
                User = userDto,
                Token = newToken,
                RefreshToken = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddHours(2)
            };

            return ApiResponse<AuthResponseDto>.SuccessResponse(authResponse, "Token refreshed successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<AuthResponseDto>.ErrorResponse($"Token refresh failed: {ex.Message}");
        }
    }

    public async Task<ApiResponse<bool>> LogoutAsync(int userId)
    {
        try
        {
            var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
            if (user == null)
            {
                return ApiResponse<bool>.ErrorResponse("User not found");
            }

            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await _unitOfWork.CompleteAsync();

            return ApiResponse<bool>.SuccessResponse(true, "Logout successful");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.ErrorResponse($"Logout failed: {ex.Message}");
        }
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
        var issuer = jwtSettings["Issuer"] ?? "NoSmokeJourney";
        var audience = jwtSettings["Audience"] ?? "NoSmokeJourneyUsers";

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomNumber);
        }
        return Convert.ToBase64String(randomNumber);
    }

    private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = true,
            ValidateIssuer = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ValidateLifetime = false,
            ValidIssuer = jwtSettings["Issuer"] ?? "NoSmokeJourney",
            ValidAudience = jwtSettings["Audience"] ?? "NoSmokeJourneyUsers"
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);

        if (securityToken is not JwtSecurityToken jwtSecurityToken ||
            !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
        {
            throw new SecurityTokenException("Invalid token");
        }

        return principal;
    }

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        return BCrypt.Net.BCrypt.Verify(password, passwordHash);
    }
}
