using NoSmokeJourney.Services.DTOs;

namespace NoSmokeJourney.Services.Interfaces;

public interface IProgressTrackerService
{
    Task<ApiResponse<ProgressTrackerDto>> GetBySmokerIdAsync(int smokerId);
    Task<ApiResponse<ProgressTrackerDto>> GetByUserIdAsync(int userId);
    Task<ApiResponse<ProgressTrackerDto>> InitializeAsync(int smokerId, DateTime quitDate);
    Task<ApiResponse<ProgressTrackerDto>> UpdateProgressAsync(int smokerId, ProgressUpdateDto dto);
    Task<ApiResponse<HealthAgeDto>> CalculateHealthAgeAsync(int smokerId);
    Task<ApiResponse<QuitTimelineDto>> GetQuitTimelineAsync(int smokerId);
}
