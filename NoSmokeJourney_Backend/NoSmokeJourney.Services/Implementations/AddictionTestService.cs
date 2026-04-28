using AutoMapper;
using NoSmokeJourney.Core.Entities;
using NoSmokeJourney.Core.Enums;
using NoSmokeJourney.Core.Interfaces;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.Services.Implementations;

public class AddictionTestService : IAddictionTestService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AddictionTestService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<AddictionTestResponseDto>> TakeTestByUserIdAsync(int userId, AddictionTestRequestDto dto)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        if (user == null)
            return ApiResponse<AddictionTestResponseDto>.ErrorResponse("User not found");

        var smoker = await _unitOfWork.Repository<Smoker>().FirstOrDefaultAsync(s => s.UserId == userId);
        if (smoker == null)
            return ApiResponse<AddictionTestResponseDto>.ErrorResponse("Smoker profile not found. Please complete your profile first.");

        return await TakeTestAsync(smoker.Id, dto);
    }

    public async Task<ApiResponse<AddictionTestResponseDto>> TakeTestAsync(int smokerId, AddictionTestRequestDto dto)
    {
        // Validate scores
        if (dto.Question1Score < 0 || dto.Question1Score > 3)
            return ApiResponse<AddictionTestResponseDto>.ErrorResponse("Invalid score for question 1");
        if (dto.Question2Score < 0 || dto.Question2Score > 1)
            return ApiResponse<AddictionTestResponseDto>.ErrorResponse("Invalid score for question 2");
        if (dto.Question3Score < 0 || dto.Question3Score > 1)
            return ApiResponse<AddictionTestResponseDto>.ErrorResponse("Invalid score for question 3");
        if (dto.Question4Score < 0 || dto.Question4Score > 3)
            return ApiResponse<AddictionTestResponseDto>.ErrorResponse("Invalid score for question 4");
        if (dto.Question5Score < 0 || dto.Question5Score > 1)
            return ApiResponse<AddictionTestResponseDto>.ErrorResponse("Invalid score for question 5");
        if (dto.Question6Score < 0 || dto.Question6Score > 1)
            return ApiResponse<AddictionTestResponseDto>.ErrorResponse("Invalid score for question 6");

        // Calculate total score
        var totalScore = dto.Question1Score + dto.Question2Score + dto.Question3Score +
                         dto.Question4Score + dto.Question5Score + dto.Question6Score;

        // Determine addiction level
        var addictionLevel = totalScore switch
        {
            <= 2 => AddictionLevel.Low,
            <= 5 => AddictionLevel.Moderate,
            _ => AddictionLevel.High
        };

        // Generate advice based on level
        var advice = addictionLevel switch
        {
            AddictionLevel.Low => "Your nicotine dependence is low. You have a good chance of quitting successfully. Consider setting a quit date and using behavioral strategies.",
            AddictionLevel.Moderate => "Your nicotine dependence is moderate. Consider using nicotine replacement therapy (NRT) or other medications to help you quit. Consult with a healthcare provider.",
            AddictionLevel.High => "Your nicotine dependence is high. It's strongly recommended to seek professional help. Consider prescription medications, NRT, and behavioral counseling for the best chance of success.",
            _ => "Please consult with a healthcare provider for personalized advice."
        };

        var test = new AddictionTest
        {
            SmokerId = smokerId,
            Question1Score = dto.Question1Score,
            Question2Score = dto.Question2Score,
            Question3Score = dto.Question3Score,
            Question4Score = dto.Question4Score,
            Question5Score = dto.Question5Score,
            Question6Score = dto.Question6Score,
            TotalScore = totalScore,
            AddictionLevel = addictionLevel,
            Advice = advice,
            TestDate = DateTime.UtcNow
        };

        await _unitOfWork.Repository<AddictionTest>().AddAsync(test);
        await _unitOfWork.CompleteAsync();

        var testDto = _mapper.Map<AddictionTestResponseDto>(test);
        return ApiResponse<AddictionTestResponseDto>.SuccessResponse(testDto, "Test completed successfully");
    }

    public async Task<ApiResponse<AddictionTestResponseDto>> GetByIdAsync(int id)
    {
        var test = await _unitOfWork.Repository<AddictionTest>().GetByIdAsync(id);
        if (test == null)
            return ApiResponse<AddictionTestResponseDto>.ErrorResponse("Test not found");

        var testDto = _mapper.Map<AddictionTestResponseDto>(test);
        return ApiResponse<AddictionTestResponseDto>.SuccessResponse(testDto);
    }

    public async Task<ApiResponse<List<AddictionTestHistoryDto>>> GetHistoryBySmokerIdAsync(int smokerId)
    {
        var tests = await _unitOfWork.Repository<AddictionTest>()
            .FindAsync(t => t.SmokerId == smokerId);

        var sortedTests = tests.OrderByDescending(t => t.TestDate).ToList();
        var testDtos = _mapper.Map<List<AddictionTestHistoryDto>>(sortedTests);

        return ApiResponse<List<AddictionTestHistoryDto>>.SuccessResponse(testDtos);
    }

    public async Task<ApiResponse<AddictionTestResponseDto>> GetLatestBySmokerIdAsync(int smokerId)
    {
        var tests = await _unitOfWork.Repository<AddictionTest>()
            .FindAsync(t => t.SmokerId == smokerId);

        var latestTest = tests.OrderByDescending(t => t.TestDate).FirstOrDefault();
        if (latestTest == null)
            return ApiResponse<AddictionTestResponseDto>.ErrorResponse("No tests found");

        var testDto = _mapper.Map<AddictionTestResponseDto>(latestTest);
        return ApiResponse<AddictionTestResponseDto>.SuccessResponse(testDto);
    }
}
