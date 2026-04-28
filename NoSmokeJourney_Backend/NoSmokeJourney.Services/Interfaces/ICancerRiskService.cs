using NoSmokeJourney.Services.DTOs;

namespace NoSmokeJourney.Services.Interfaces;

public interface ICancerRiskService
{
    Task<ApiResponse<CancerRiskResponseDto>> AssessRiskAsync(int smokerId, CancerRiskRequestDto dto);
    Task<ApiResponse<CancerRiskResponseDto>> GetByIdAsync(int id);
    Task<ApiResponse<List<CancerRiskHistoryDto>>> GetHistoryBySmokerIdAsync(int smokerId);
    Task<ApiResponse<CancerRiskResponseDto>> GetLatestBySmokerIdAsync(int smokerId);
}
