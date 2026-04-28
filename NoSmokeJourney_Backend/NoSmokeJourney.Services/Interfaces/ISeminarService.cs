using NoSmokeJourney.Services.DTOs;

namespace NoSmokeJourney.Services.Interfaces;

public interface ISeminarService
{
    Task<ApiResponse<SeminarDto>> GetByIdAsync(int id);
    Task<ApiResponse<List<SeminarDto>>> GetAllAsync();
    Task<ApiResponse<List<SeminarDto>>> GetUpcomingAsync();
    Task<ApiResponse<PagedResponse<SeminarDto>>> GetPagedAsync(PaginationParams paginationParams);
    Task<ApiResponse<SeminarDto>> CreateAsync(SeminarCreateDto dto);
    Task<ApiResponse<SeminarDto>> UpdateAsync(int id, SeminarUpdateDto dto);
    Task<ApiResponse<bool>> DeleteAsync(int id);
    Task<ApiResponse<SeminarRegistrationDto>> RegisterAsync(int userId, RegisterForSeminarDto dto);
    Task<ApiResponse<bool>> CancelRegistrationAsync(int registrationId);
    Task<ApiResponse<List<SeminarRegistrationDto>>> GetUserRegistrationsAsync(int userId);
}
