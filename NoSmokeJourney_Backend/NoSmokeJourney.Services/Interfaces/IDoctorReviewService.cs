using NoSmokeJourney.Services.DTOs;

namespace NoSmokeJourney.Services.Interfaces;

public interface IDoctorReviewService
{
    Task<ApiResponse<DoctorReviewDto>> GetByIdAsync(int id);
    Task<ApiResponse<List<DoctorReviewDto>>> GetByDoctorIdAsync(int doctorId);
    Task<ApiResponse<List<DoctorReviewDto>>> GetByUserIdAsync(int userId);
    Task<ApiResponse<DoctorReviewDto>> CreateAsync(int userId, DoctorReviewCreateDto dto);
    Task<ApiResponse<DoctorReviewDto>> UpdateAsync(int id, DoctorReviewUpdateDto dto);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}
