using NoSmokeJourney.Services.DTOs;

namespace NoSmokeJourney.Services.Interfaces;

public interface IUserService
{
    Task<ApiResponse<UserDto>> GetByIdAsync(int id);
    Task<ApiResponse<UserDto>> GetByEmailAsync(string email);
    Task<ApiResponse<List<UserDto>>> GetAllAsync();
    Task<ApiResponse<PagedResponse<UserDto>>> GetPagedAsync(PaginationParams paginationParams);
    Task<ApiResponse<UserDto>> UpdateAsync(int id, UserUpdateDto dto);
    Task<ApiResponse<UserDto>> CompleteProfileAsync(int userId, UserProfileCompleteDto dto);
    Task<ApiResponse<bool>> DeleteAsync(int id);
    Task<ApiResponse<bool>> ChangePasswordAsync(int userId, ChangePasswordDto dto);
}
