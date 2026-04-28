using NoSmokeJourney.Services.DTOs;

namespace NoSmokeJourney.Services.Interfaces;

public interface IDoctorService
{
    Task<ApiResponse<DoctorDto>> GetByIdAsync(int id);
    Task<ApiResponse<List<DoctorDto>>> GetAllAsync();
    Task<ApiResponse<PagedResponse<DoctorDto>>> GetPagedAsync(PaginationParams paginationParams);
    Task<ApiResponse<List<DoctorDto>>> GetByFilterAsync(DoctorFilterDto filter);
    Task<ApiResponse<DoctorDto>> CreateAsync(DoctorCreateDto dto);
    Task<ApiResponse<DoctorDto>> UpdateAsync(int id, DoctorUpdateDto dto);
    Task<ApiResponse<bool>> DeleteAsync(int id);
    Task<ApiResponse<double>> GetAverageRatingAsync(int doctorId);
}
