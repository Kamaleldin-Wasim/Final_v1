using NoSmokeJourney.Services.DTOs;

namespace NoSmokeJourney.Services.Interfaces;

public interface ISmokerService
{
    Task<ApiResponse<SmokerDto>> GetByIdAsync(int id);
    Task<ApiResponse<SmokerDto>> GetByUserIdAsync(int userId);
    Task<ApiResponse<SmokerDto>> CreateAsync(int userId, SmokerCreateDto dto);
    Task<ApiResponse<SmokerDto>> UpdateAsync(int id, SmokerUpdateDto dto);
    Task<ApiResponse<bool>> DeleteAsync(int id);
    Task<ApiResponse<SmokerDto>> SetQuitDateAsync(int smokerId, SetQuitDateDto dto);
}
