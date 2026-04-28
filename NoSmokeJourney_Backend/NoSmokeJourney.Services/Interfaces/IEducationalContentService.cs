using NoSmokeJourney.Services.DTOs;

namespace NoSmokeJourney.Services.Interfaces;

public interface IEducationalContentService
{
    Task<ApiResponse<EducationalContentDto>> GetByIdAsync(int id);
    Task<ApiResponse<List<EducationalContentDto>>> GetAllAsync();
    Task<ApiResponse<List<EducationalContentDto>>> GetByTypeAsync(string type);
    Task<ApiResponse<List<EducationalContentDto>>> GetByBodyOrganAsync(string bodyOrgan);
    Task<ApiResponse<PagedResponse<EducationalContentDto>>> GetPagedAsync(PaginationParams paginationParams);
    Task<ApiResponse<EducationalContentDto>> CreateAsync(EducationalContentCreateDto dto);
    Task<ApiResponse<EducationalContentDto>> UpdateAsync(int id, EducationalContentUpdateDto dto);
    Task<ApiResponse<bool>> DeleteAsync(int id);
    Task<ApiResponse<bool>> IncrementViewCountAsync(int id);
}
