using NoSmokeJourney.Services.DTOs;

namespace NoSmokeJourney.Services.Interfaces;

public interface IAddictionTestService
{
    Task<ApiResponse<AddictionTestResponseDto>> TakeTestAsync(int smokerId, AddictionTestRequestDto dto);
    Task<ApiResponse<AddictionTestResponseDto>> TakeTestByUserIdAsync(int userId, AddictionTestRequestDto dto);
    Task<ApiResponse<AddictionTestResponseDto>> GetByIdAsync(int id);
    Task<ApiResponse<List<AddictionTestHistoryDto>>> GetHistoryBySmokerIdAsync(int smokerId);
    Task<ApiResponse<AddictionTestResponseDto>> GetLatestBySmokerIdAsync(int smokerId);
}
