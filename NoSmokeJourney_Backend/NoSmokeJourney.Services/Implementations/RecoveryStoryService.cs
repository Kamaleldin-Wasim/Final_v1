using AutoMapper;
using Microsoft.EntityFrameworkCore;
using NoSmokeJourney.Core.Entities;
using NoSmokeJourney.Core.Enums;
using NoSmokeJourney.Core.Interfaces;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.Services.Implementations;

public class RecoveryStoryService : IRecoveryStoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public RecoveryStoryService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<RecoveryStoryDto>> GetByIdAsync(int id)
    {
        var stories = await _unitOfWork.Repository<RecoveryStory>().FindAsync(s => s.Id == id,
            q => q.Include(s => s.User));
            
        var story = stories.FirstOrDefault();
        if (story == null)
            return ApiResponse<RecoveryStoryDto>.ErrorResponse("Story not found");
 
        // Increment view count
        story.ViewCount++;
        _unitOfWork.Repository<RecoveryStory>().Update(story);
        await _unitOfWork.CompleteAsync();
 
        var storyDto = _mapper.Map<RecoveryStoryDto>(story);
        return ApiResponse<RecoveryStoryDto>.SuccessResponse(storyDto);
    }
 
    public async Task<ApiResponse<List<RecoveryStoryDto>>> GetAllAsync()
    {
        var stories = await _unitOfWork.Repository<RecoveryStory>().GetAllAsync(
            q => q.Include(s => s.User));
            
        var storyDtos = _mapper.Map<List<RecoveryStoryDto>>(stories);
        return ApiResponse<List<RecoveryStoryDto>>.SuccessResponse(storyDtos);
    }
 
    public async Task<ApiResponse<List<RecoveryStoryDto>>> GetApprovedAsync()
    {
        var stories = await _unitOfWork.Repository<RecoveryStory>()
            .FindAsync(s => s.Status == StoryStatus.Approved,
                q => q.Include(s => s.User));
 
        var storyDtos = _mapper.Map<List<RecoveryStoryDto>>(stories);
        return ApiResponse<List<RecoveryStoryDto>>.SuccessResponse(storyDtos);
    }

    public async Task<ApiResponse<List<RecoveryStoryDto>>> GetPendingAsync()
    {
        var stories = await _unitOfWork.Repository<RecoveryStory>()
            .FindAsync(s => s.Status == StoryStatus.Pending,
                q => q.Include(s => s.User));
 
        var storyDtos = _mapper.Map<List<RecoveryStoryDto>>(stories);
        return ApiResponse<List<RecoveryStoryDto>>.SuccessResponse(storyDtos);
    }

    public async Task<ApiResponse<PagedResponse<RecoveryStoryDto>>> GetPagedAsync(PaginationParams paginationParams, StoryStatus? status = null)
    {
        IEnumerable<RecoveryStory> query;
        if (status.HasValue)
        {
            query = await _unitOfWork.Repository<RecoveryStory>().FindAsync(s => s.Status == status.Value,
                q => q.Include(s => s.User));
        }
        else
        {
            query = await _unitOfWork.Repository<RecoveryStory>().GetAllAsync(
                q => q.Include(s => s.User));
        }

        var stories = query.OrderByDescending(s => s.CreatedAt).ToList();

        var totalCount = stories.Count;
        var pagedStories = stories
            .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
            .Take(paginationParams.PageSize)
            .ToList();

        var storyDtos = _mapper.Map<List<RecoveryStoryDto>>(pagedStories);

        var pagedResponse = new PagedResponse<RecoveryStoryDto>
        {
            Items = storyDtos,
            PageNumber = paginationParams.PageNumber,
            PageSize = paginationParams.PageSize,
            TotalCount = totalCount
        };

        return ApiResponse<PagedResponse<RecoveryStoryDto>>.SuccessResponse(pagedResponse);
    }

    public async Task<ApiResponse<RecoveryStoryDto>> CreateAsync(int userId, RecoveryStoryCreateDto dto)
    {
        var story = _mapper.Map<RecoveryStory>(dto);
        story.UserId = userId;
        story.Status = StoryStatus.Pending;
        story.CreatedAt = DateTime.UtcNow;

        await _unitOfWork.Repository<RecoveryStory>().AddAsync(story);
        await _unitOfWork.CompleteAsync();

        var storyDto = _mapper.Map<RecoveryStoryDto>(story);
        return ApiResponse<RecoveryStoryDto>.SuccessResponse(storyDto, "Story submitted successfully and is pending approval");
    }

    public async Task<ApiResponse<RecoveryStoryDto>> UpdateAsync(int id, RecoveryStoryUpdateDto dto)
    {
        var story = await _unitOfWork.Repository<RecoveryStory>().GetByIdAsync(id);
        if (story == null)
            return ApiResponse<RecoveryStoryDto>.ErrorResponse("Story not found");

        _mapper.Map(dto, story);
        story.Status = StoryStatus.Pending; // Reset to pending after update
        story.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Repository<RecoveryStory>().Update(story);
        await _unitOfWork.CompleteAsync();

        var storyDto = _mapper.Map<RecoveryStoryDto>(story);
        return ApiResponse<RecoveryStoryDto>.SuccessResponse(storyDto, "Story updated successfully");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var story = await _unitOfWork.Repository<RecoveryStory>().GetByIdAsync(id);
        if (story == null)
            return ApiResponse<bool>.ErrorResponse("Story not found");

        _unitOfWork.Repository<RecoveryStory>().Delete(story);
        await _unitOfWork.CompleteAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Story deleted successfully");
    }

    public async Task<ApiResponse<RecoveryStoryDto>> ApproveAsync(int storyId, int adminId)
    {
        var story = await _unitOfWork.Repository<RecoveryStory>().GetByIdAsync(storyId);
        if (story == null)
            return ApiResponse<RecoveryStoryDto>.ErrorResponse("Story not found");

        story.Status = StoryStatus.Approved;
        story.ApprovedByAdminId = adminId;
        story.PublishedAt = DateTime.UtcNow;
        story.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Repository<RecoveryStory>().Update(story);
        await _unitOfWork.CompleteAsync();

        var storyDto = _mapper.Map<RecoveryStoryDto>(story);
        return ApiResponse<RecoveryStoryDto>.SuccessResponse(storyDto, "Story approved successfully");
    }

    public async Task<ApiResponse<RecoveryStoryDto>> RejectAsync(int storyId, string reason)
    {
        var story = await _unitOfWork.Repository<RecoveryStory>().GetByIdAsync(storyId);
        if (story == null)
            return ApiResponse<RecoveryStoryDto>.ErrorResponse("Story not found");

        story.Status = StoryStatus.Rejected;
        story.RejectionReason = reason;
        story.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Repository<RecoveryStory>().Update(story);
        await _unitOfWork.CompleteAsync();

        var storyDto = _mapper.Map<RecoveryStoryDto>(story);
        return ApiResponse<RecoveryStoryDto>.SuccessResponse(storyDto, "Story rejected");
    }
}
