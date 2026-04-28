using AutoMapper;
using NoSmokeJourney.Core.Entities;
using NoSmokeJourney.Core.Interfaces;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.Services.Implementations;

public class SmokerService : ISmokerService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public SmokerService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<SmokerDto>> GetByIdAsync(int id)
    {
        var smoker = await _unitOfWork.Repository<Smoker>().GetByIdAsync(id);
        if (smoker == null)
            return ApiResponse<SmokerDto>.ErrorResponse("Smoker profile not found");

        var smokerDto = _mapper.Map<SmokerDto>(smoker);
        return ApiResponse<SmokerDto>.SuccessResponse(smokerDto);
    }

    public async Task<ApiResponse<SmokerDto>> GetByUserIdAsync(int userId)
    {
        var smoker = await _unitOfWork.Repository<Smoker>()
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (smoker == null)
            return ApiResponse<SmokerDto>.ErrorResponse("Smoker profile not found");

        var smokerDto = _mapper.Map<SmokerDto>(smoker);
        return ApiResponse<SmokerDto>.SuccessResponse(smokerDto);
    }

    public async Task<ApiResponse<SmokerDto>> CreateAsync(int userId, SmokerCreateDto dto)
    {
        // Check if user exists
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        if (user == null)
            return ApiResponse<SmokerDto>.ErrorResponse("User not found");

        // Check if smoker profile already exists
        var existingSmoker = await _unitOfWork.Repository<Smoker>()
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (existingSmoker != null)
            return ApiResponse<SmokerDto>.ErrorResponse("Smoker profile already exists for this user");

        var smoker = _mapper.Map<Smoker>(dto);
        smoker.UserId = userId;

        await _unitOfWork.Repository<Smoker>().AddAsync(smoker);
        await _unitOfWork.CompleteAsync();

        var smokerDto = _mapper.Map<SmokerDto>(smoker);
        return ApiResponse<SmokerDto>.SuccessResponse(smokerDto, "Smoker profile created successfully");
    }

    public async Task<ApiResponse<SmokerDto>> UpdateAsync(int id, SmokerUpdateDto dto)
    {
        var smoker = await _unitOfWork.Repository<Smoker>().GetByIdAsync(id);
        if (smoker == null)
            return ApiResponse<SmokerDto>.ErrorResponse("Smoker profile not found");

        _mapper.Map(dto, smoker);
        smoker.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Repository<Smoker>().Update(smoker);
        await _unitOfWork.CompleteAsync();

        var smokerDto = _mapper.Map<SmokerDto>(smoker);
        return ApiResponse<SmokerDto>.SuccessResponse(smokerDto, "Smoker profile updated successfully");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var smoker = await _unitOfWork.Repository<Smoker>().GetByIdAsync(id);
        if (smoker == null)
            return ApiResponse<bool>.ErrorResponse("Smoker profile not found");

        _unitOfWork.Repository<Smoker>().Delete(smoker);
        await _unitOfWork.CompleteAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Smoker profile deleted successfully");
    }

    public async Task<ApiResponse<SmokerDto>> SetQuitDateAsync(int smokerId, SetQuitDateDto dto)
    {
        var smoker = await _unitOfWork.Repository<Smoker>().GetByIdAsync(smokerId);
        if (smoker == null)
            return ApiResponse<SmokerDto>.ErrorResponse("Smoker profile not found");

        smoker.QuitDate = dto.QuitDate;
        smoker.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Repository<Smoker>().Update(smoker);
        await _unitOfWork.CompleteAsync();

        // Initialize progress tracker if not exists
        var existingTracker = await _unitOfWork.Repository<ProgressTracker>()
            .FirstOrDefaultAsync(pt => pt.SmokerId == smokerId);

        if (existingTracker == null)
        {
            var tracker = new ProgressTracker
            {
                SmokerId = smokerId,
                QuitDate = dto.QuitDate,
                CigarettesAvoided = 0,
                MoneySaved = 0,
                HealthTimeRegained = 0
            };
            await _unitOfWork.Repository<ProgressTracker>().AddAsync(tracker);
            await _unitOfWork.CompleteAsync();
        }
        else
        {
            existingTracker.QuitDate = dto.QuitDate;
            existingTracker.LastUpdated = DateTime.UtcNow;
            _unitOfWork.Repository<ProgressTracker>().Update(existingTracker);
            await _unitOfWork.CompleteAsync();
        }

        var smokerDto = _mapper.Map<SmokerDto>(smoker);
        return ApiResponse<SmokerDto>.SuccessResponse(smokerDto, "Quit date set successfully");
    }
}
