using NoSmokeJourney.Services.DTOs;

namespace NoSmokeJourney.Services.Interfaces;

public interface IMedicalCenterService
{
    Task<ApiResponse<MedicalCenterDto>> GetByIdAsync(int id);
    Task<ApiResponse<List<MedicalCenterDto>>> GetAllAsync();
    Task<ApiResponse<PagedResponse<MedicalCenterDto>>> GetPagedAsync(PaginationParams paginationParams);
    Task<ApiResponse<MedicalCenterDto>> CreateAsync(MedicalCenterCreateDto dto);
    Task<ApiResponse<MedicalCenterDto>> UpdateAsync(int id, MedicalCenterUpdateDto dto);
    Task<ApiResponse<bool>> DeleteAsync(int id);
    Task<ApiResponse<List<MedicalCenterDto>>> GetNearbyAsync(double latitude, double longitude, double radiusKm);
}
