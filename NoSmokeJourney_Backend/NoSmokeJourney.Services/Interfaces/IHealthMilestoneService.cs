using NoSmokeJourney.Services.DTOs;

namespace NoSmokeJourney.Services.Interfaces;

public interface IHealthMilestoneService
{
    Task<ApiResponse<HealthMilestoneDto>> GetByIdAsync(int id);
    Task<ApiResponse<List<HealthMilestoneDto>>> GetAllAsync();
    Task<ApiResponse<List<HealthMilestoneDto>>> GetActiveAsync();
    Task<ApiResponse<HealthMilestoneDto>> CreateAsync(HealthMilestoneCreateDto dto);
    Task<ApiResponse<HealthMilestoneDto>> UpdateAsync(int id, HealthMilestoneUpdateDto dto);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}
