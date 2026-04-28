using NoSmokeJourney.Core.Enums;
using NoSmokeJourney.Services.DTOs;

namespace NoSmokeJourney.Services.Interfaces;

public interface IRecoveryStoryService
{
    Task<ApiResponse<RecoveryStoryDto>> GetByIdAsync(int id);
    Task<ApiResponse<List<RecoveryStoryDto>>> GetAllAsync();
    Task<ApiResponse<List<RecoveryStoryDto>>> GetApprovedAsync();
    Task<ApiResponse<List<RecoveryStoryDto>>> GetPendingAsync();
    Task<ApiResponse<PagedResponse<RecoveryStoryDto>>> GetPagedAsync(PaginationParams paginationParams, StoryStatus? status = null);
    Task<ApiResponse<RecoveryStoryDto>> CreateAsync(int userId, RecoveryStoryCreateDto dto);
    Task<ApiResponse<RecoveryStoryDto>> UpdateAsync(int id, RecoveryStoryUpdateDto dto);
    Task<ApiResponse<bool>> DeleteAsync(int id);
    Task<ApiResponse<RecoveryStoryDto>> ApproveAsync(int storyId, int adminId);
    Task<ApiResponse<RecoveryStoryDto>> RejectAsync(int storyId, string reason);
}
