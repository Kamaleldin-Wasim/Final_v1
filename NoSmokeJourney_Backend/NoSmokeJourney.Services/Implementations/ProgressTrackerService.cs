using AutoMapper;
using NoSmokeJourney.Core.Entities;
using NoSmokeJourney.Core.Interfaces;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.Services.Implementations;

public class ProgressTrackerService : IProgressTrackerService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ProgressTrackerService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<ProgressTrackerDto>> GetByUserIdAsync(int userId)
    {
        var smoker = await _unitOfWork.Repository<Smoker>().FirstOrDefaultAsync(s => s.UserId == userId);
        if (smoker == null)
            return ApiResponse<ProgressTrackerDto>.ErrorResponse("Smoker profile not found. Please complete your profile first.");

        return await GetBySmokerIdAsync(smoker.Id);
    }

    public async Task<ApiResponse<ProgressTrackerDto>> GetBySmokerIdAsync(int smokerId)
    {
        var tracker = await _unitOfWork.Repository<ProgressTracker>()
            .FirstOrDefaultAsync(pt => pt.SmokerId == smokerId);

        if (tracker == null)
            return ApiResponse<ProgressTrackerDto>.ErrorResponse("Progress tracker not found");

        // Update progress
        await UpdateProgressAsync(tracker);

        var trackerDto = _mapper.Map<ProgressTrackerDto>(tracker);

        // Add milestones
        var milestones = await _unitOfWork.Repository<HealthMilestone>().GetAllAsync();
        var milestoneDtos = new List<MilestoneDto>();

        foreach (var milestone in milestones.OrderBy(m => m.TimeAfterQuit))
        {
            var isAchieved = tracker.SmokeFreeDays >= milestone.TimeAfterQuit.TotalDays;
            var achievedAt = isAchieved ? tracker.QuitDate.Add(milestone.TimeAfterQuit) : (DateTime?)null;

            milestoneDtos.Add(new MilestoneDto
            {
                Title = milestone.Title,
                Description = milestone.Description,
                TimeAfterQuit = milestone.TimeAfterQuit,
                IconUrl = milestone.IconUrl,
                IsAchieved = isAchieved,
                AchievedAt = achievedAt
            });
        }

        trackerDto.AchievedMilestones = milestoneDtos.Where(m => m.IsAchieved).ToList();
        trackerDto.UpcomingMilestones = milestoneDtos.Where(m => !m.IsAchieved).Take(3).ToList();

        return ApiResponse<ProgressTrackerDto>.SuccessResponse(trackerDto);
    }

    public async Task<ApiResponse<ProgressTrackerDto>> InitializeAsync(int smokerId, DateTime quitDate)
    {
        var smoker = await _unitOfWork.Repository<Smoker>().GetByIdAsync(smokerId);
        if (smoker == null)
            return ApiResponse<ProgressTrackerDto>.ErrorResponse("Smoker not found");

        // Check if tracker already exists
        var existingTracker = await _unitOfWork.Repository<ProgressTracker>()
            .FirstOrDefaultAsync(pt => pt.SmokerId == smokerId);

        if (existingTracker != null)
        {
            existingTracker.QuitDate = quitDate;
            existingTracker.LastUpdated = DateTime.UtcNow;
            _unitOfWork.Repository<ProgressTracker>().Update(existingTracker);
        }
        else
        {
            var tracker = new ProgressTracker
            {
                SmokerId = smokerId,
                QuitDate = quitDate,
                CigarettesAvoided = 0,
                MoneySaved = 0,
                HealthTimeRegained = 0
            };
            await _unitOfWork.Repository<ProgressTracker>().AddAsync(tracker);
        }

        // Update smoker's quit date
        smoker.QuitDate = quitDate;
        _unitOfWork.Repository<Smoker>().Update(smoker);

        await _unitOfWork.CompleteAsync();

        return await GetBySmokerIdAsync(smokerId);
    }

    public async Task<ApiResponse<ProgressTrackerDto>> UpdateProgressAsync(int smokerId, ProgressUpdateDto dto)
    {
        var tracker = await _unitOfWork.Repository<ProgressTracker>()
            .FirstOrDefaultAsync(pt => pt.SmokerId == smokerId);

        if (tracker == null)
            return ApiResponse<ProgressTrackerDto>.ErrorResponse("Progress tracker not found");

        tracker.CigarettesAvoided = dto.CigarettesAvoided;
        tracker.MoneySaved = dto.MoneySaved;
        tracker.HealthTimeRegained = dto.HealthTimeRegained;
        tracker.LastUpdated = DateTime.UtcNow;

        _unitOfWork.Repository<ProgressTracker>().Update(tracker);
        await _unitOfWork.CompleteAsync();

        var trackerDto = _mapper.Map<ProgressTrackerDto>(tracker);
        return ApiResponse<ProgressTrackerDto>.SuccessResponse(trackerDto, "Progress updated successfully");
    }

    public async Task<ApiResponse<HealthAgeDto>> CalculateHealthAgeAsync(int smokerId)
    {
        var smoker = await _unitOfWork.Repository<Smoker>().GetByIdAsync(smokerId);
        if (smoker == null)
            return ApiResponse<HealthAgeDto>.ErrorResponse("Smoker not found");

        var tracker = await _unitOfWork.Repository<ProgressTracker>()
            .FirstOrDefaultAsync(pt => pt.SmokerId == smokerId);

        if (tracker == null || tracker.QuitDate == DateTime.MinValue)
            return ApiResponse<HealthAgeDto>.ErrorResponse("Quit date not set");

        var smokeFreeDays = tracker.SmokeFreeDays;
        var actualAge = smoker.Age;

        // Calculate health age based on smoke-free days
        // Every 30 days smoke-free reduces health age by approximately 1 month
        var healthAgeReduction = smokeFreeDays / 30.0;
        var healthAge = Math.Max(actualAge - (int)healthAgeReduction, actualAge - 5); // Cap at 5 years reduction

        var message = smokeFreeDays switch
        {
            < 30 => "Your body is beginning to heal. Keep going!",
            < 90 => "Great progress! Your health is improving every day.",
            < 180 => "Excellent! Significant health improvements achieved.",
            < 365 => "Fantastic! Your body has made remarkable recovery.",
            _ => "Outstanding! Your health age has significantly improved."
        };

        var result = new HealthAgeDto
        {
            ActualAge = actualAge,
            HealthAge = healthAge,
            Message = message
        };

        // Update tracker
        tracker.HealthAge = healthAge;
        _unitOfWork.Repository<ProgressTracker>().Update(tracker);
        await _unitOfWork.CompleteAsync();

        return ApiResponse<HealthAgeDto>.SuccessResponse(result);
    }

    public async Task<ApiResponse<QuitTimelineDto>> GetQuitTimelineAsync(int smokerId)
    {
        var tracker = await _unitOfWork.Repository<ProgressTracker>()
            .FirstOrDefaultAsync(pt => pt.SmokerId == smokerId);

        if (tracker == null || tracker.QuitDate == DateTime.MinValue)
            return ApiResponse<QuitTimelineDto>.ErrorResponse("Quit date not set");

        var milestones = await _unitOfWork.Repository<HealthMilestone>().GetAllAsync();
        var timeline = new List<TimelineMilestoneDto>();

        foreach (var milestone in milestones.Where(m => m.IsActive).OrderBy(m => m.TimeAfterQuit))
        {
            var targetDate = tracker.QuitDate.Add(milestone.TimeAfterQuit);
            var isAchieved = DateTime.UtcNow >= targetDate;

            timeline.Add(new TimelineMilestoneDto
            {
                Title = milestone.Title,
                Description = milestone.Description,
                TimeAfterQuit = FormatTimeSpan(milestone.TimeAfterQuit),
                IsAchieved = isAchieved,
                TargetDate = targetDate,
                AchievedDate = isAchieved ? targetDate : null,
                IconUrl = milestone.IconUrl,
                Benefits = milestone.Benefits
            });
        }

        var result = new QuitTimelineDto
        {
            QuitDate = tracker.QuitDate,
            SmokeFreeDays = tracker.SmokeFreeDays,
            Timeline = timeline
        };

        return ApiResponse<QuitTimelineDto>.SuccessResponse(result);
    }

    private async Task UpdateProgressAsync(ProgressTracker tracker)
    {
        if (tracker.QuitDate == DateTime.MinValue) return;

        var smoker = await _unitOfWork.Repository<Smoker>().GetByIdAsync(tracker.SmokerId);
        if (smoker == null) return;

        var smokeFreeDays = tracker.SmokeFreeDays;

        // Calculate cigarettes avoided
        tracker.CigarettesAvoided = smokeFreeDays * smoker.CigarettesPerDay;

        // Calculate money saved
        if (smoker.CigarettePrice.HasValue)
        {
            tracker.MoneySaved = smokeFreeDays * smoker.CigarettesPerDay * smoker.CigarettePrice.Value;
        }

        // Calculate health time regained (approximately 11 minutes per cigarette)
        tracker.HealthTimeRegained = tracker.CigarettesAvoided * 11;

        // Update milestones
        UpdateMilestones(tracker, smokeFreeDays);

        tracker.LastUpdated = DateTime.UtcNow;
        _unitOfWork.Repository<ProgressTracker>().Update(tracker);
        await _unitOfWork.CompleteAsync();
    }

    private void UpdateMilestones(ProgressTracker tracker, int smokeFreeDays)
    {
        tracker.Reached20Minutes = smokeFreeDays >= 0;
        tracker.Reached12Hours = smokeFreeDays >= 1;
        tracker.Reached24Hours = smokeFreeDays >= 1;
        tracker.Reached48Hours = smokeFreeDays >= 2;
        tracker.Reached1Week = smokeFreeDays >= 7;
        tracker.Reached2Weeks = smokeFreeDays >= 14;
        tracker.Reached1Month = smokeFreeDays >= 30;
        tracker.Reached3Months = smokeFreeDays >= 90;
        tracker.Reached6Months = smokeFreeDays >= 180;
        tracker.Reached1Year = smokeFreeDays >= 365;
        tracker.Reached5Years = smokeFreeDays >= 365 * 5;
        tracker.Reached10Years = smokeFreeDays >= 365 * 10;
        tracker.Reached15Years = smokeFreeDays >= 365 * 15;
    }

    private string FormatTimeSpan(TimeSpan timeSpan)
    {
        if (timeSpan.TotalMinutes < 60)
            return $"{timeSpan.TotalMinutes:F0} minutes";
        if (timeSpan.TotalHours < 24)
            return $"{timeSpan.TotalHours:F0} hours";
        if (timeSpan.TotalDays < 30)
            return $"{timeSpan.TotalDays:F0} days";
        if (timeSpan.TotalDays < 365)
            return $"{timeSpan.TotalDays / 30:F0} months";
        return $"{timeSpan.TotalDays / 365:F0} years";
    }
}
