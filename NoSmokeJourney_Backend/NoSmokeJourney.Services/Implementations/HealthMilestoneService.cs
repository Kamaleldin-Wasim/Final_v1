using AutoMapper;
using NoSmokeJourney.Core.Entities;
using NoSmokeJourney.Core.Interfaces;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.Services.Implementations;

public class HealthMilestoneService : IHealthMilestoneService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public HealthMilestoneService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<HealthMilestoneDto>> GetByIdAsync(int id)
    {
        var milestone = await _unitOfWork.Repository<HealthMilestone>().GetByIdAsync(id);
        if (milestone == null)
            return ApiResponse<HealthMilestoneDto>.ErrorResponse("Milestone not found");

        var milestoneDto = _mapper.Map<HealthMilestoneDto>(milestone);
        return ApiResponse<HealthMilestoneDto>.SuccessResponse(milestoneDto);
    }

    public async Task<ApiResponse<List<HealthMilestoneDto>>> GetAllAsync()
    {
        var milestones = await _unitOfWork.Repository<HealthMilestone>().GetAllAsync();
        var sortedMilestones = milestones.OrderBy(m => m.TimeAfterQuit);
        var milestoneDtos = _mapper.Map<List<HealthMilestoneDto>>(sortedMilestones);
        return ApiResponse<List<HealthMilestoneDto>>.SuccessResponse(milestoneDtos);
    }

    public async Task<ApiResponse<List<HealthMilestoneDto>>> GetActiveAsync()
    {
        var milestones = await _unitOfWork.Repository<HealthMilestone>()
            .FindAsync(m => m.IsActive);

        var sortedMilestones = milestones.OrderBy(m => m.TimeAfterQuit);
        var milestoneDtos = _mapper.Map<List<HealthMilestoneDto>>(sortedMilestones);
        return ApiResponse<List<HealthMilestoneDto>>.SuccessResponse(milestoneDtos);
    }

    public async Task<ApiResponse<HealthMilestoneDto>> CreateAsync(HealthMilestoneCreateDto dto)
    {
        var milestone = _mapper.Map<HealthMilestone>(dto);
        await _unitOfWork.Repository<HealthMilestone>().AddAsync(milestone);
        await _unitOfWork.CompleteAsync();

        var milestoneDto = _mapper.Map<HealthMilestoneDto>(milestone);
        return ApiResponse<HealthMilestoneDto>.SuccessResponse(milestoneDto, "Milestone created successfully");
    }

    public async Task<ApiResponse<HealthMilestoneDto>> UpdateAsync(int id, HealthMilestoneUpdateDto dto)
    {
        var milestone = await _unitOfWork.Repository<HealthMilestone>().GetByIdAsync(id);
        if (milestone == null)
            return ApiResponse<HealthMilestoneDto>.ErrorResponse("Milestone not found");

        _mapper.Map(dto, milestone);
        milestone.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Repository<HealthMilestone>().Update(milestone);
        await _unitOfWork.CompleteAsync();

        var milestoneDto = _mapper.Map<HealthMilestoneDto>(milestone);
        return ApiResponse<HealthMilestoneDto>.SuccessResponse(milestoneDto, "Milestone updated successfully");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var milestone = await _unitOfWork.Repository<HealthMilestone>().GetByIdAsync(id);
        if (milestone == null)
            return ApiResponse<bool>.ErrorResponse("Milestone not found");

        _unitOfWork.Repository<HealthMilestone>().Delete(milestone);
        await _unitOfWork.CompleteAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Milestone deleted successfully");
    }
}
