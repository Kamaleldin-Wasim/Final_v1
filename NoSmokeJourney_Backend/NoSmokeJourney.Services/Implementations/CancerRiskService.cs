using AutoMapper;
using NoSmokeJourney.Core.Entities;
using NoSmokeJourney.Core.Enums;
using NoSmokeJourney.Core.Interfaces;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.Services.Implementations;

public class CancerRiskService : ICancerRiskService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CancerRiskService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<CancerRiskResponseDto>> AssessRiskAsync(int smokerId, CancerRiskRequestDto dto)
    {
        // Calculate base risk percentage based on smoking history
        var baseRisk = CalculateBaseRisk(dto.Age, dto.CigarettesPerDay, dto.YearsOfSmoking);

        // Adjust for family history
        if (dto.HasFamilyHistory)
            baseRisk *= 1.5;

        // Adjust for symptoms
        if (dto.HasPersistentCough)
            baseRisk *= 1.3;
        if (dto.HasChestPain)
            baseRisk *= 1.4;
        if (dto.HasShortnessOfBreath)
            baseRisk *= 1.3;
        if (dto.HasBloodInCough)
            baseRisk *= 2.0;
        if (dto.HasUnexplainedWeightLoss)
            baseRisk *= 1.5;

        // Cap at 95%
        var finalRisk = Math.Min(baseRisk, 95);

        // Determine risk level
        var riskLevel = finalRisk switch
        {
            < 20 => RiskLevel.Low,
            < 50 => RiskLevel.Medium,
            _ => RiskLevel.High
        };

        // Generate recommendations
        var recommendations = GenerateRecommendations(riskLevel, dto);

        var assessment = new CancerRiskAssessment
        {
            SmokerId = smokerId,
            Age = dto.Age,
            CigarettesPerDay = dto.CigarettesPerDay,
            YearsOfSmoking = dto.YearsOfSmoking,
            HasFamilyHistory = dto.HasFamilyHistory,
            HasPersistentCough = dto.HasPersistentCough,
            HasChestPain = dto.HasChestPain,
            HasShortnessOfBreath = dto.HasShortnessOfBreath,
            HasBloodInCough = dto.HasBloodInCough,
            HasUnexplainedWeightLoss = dto.HasUnexplainedWeightLoss,
            RiskLevel = riskLevel,
            RiskPercentage = Math.Round(finalRisk, 2),
            Recommendations = recommendations,
            AssessmentDate = DateTime.UtcNow
        };

        await _unitOfWork.Repository<CancerRiskAssessment>().AddAsync(assessment);
        await _unitOfWork.CompleteAsync();

        var assessmentDto = _mapper.Map<CancerRiskResponseDto>(assessment);
        return ApiResponse<CancerRiskResponseDto>.SuccessResponse(assessmentDto, "Risk assessment completed");
    }

    public async Task<ApiResponse<CancerRiskResponseDto>> GetByIdAsync(int id)
    {
        var assessment = await _unitOfWork.Repository<CancerRiskAssessment>().GetByIdAsync(id);
        if (assessment == null)
            return ApiResponse<CancerRiskResponseDto>.ErrorResponse("Assessment not found");

        var assessmentDto = _mapper.Map<CancerRiskResponseDto>(assessment);
        return ApiResponse<CancerRiskResponseDto>.SuccessResponse(assessmentDto);
    }

    public async Task<ApiResponse<List<CancerRiskHistoryDto>>> GetHistoryBySmokerIdAsync(int smokerId)
    {
        var assessments = await _unitOfWork.Repository<CancerRiskAssessment>()
            .FindAsync(a => a.SmokerId == smokerId);

        var sortedAssessments = assessments.OrderByDescending(a => a.AssessmentDate).ToList();
        var assessmentDtos = _mapper.Map<List<CancerRiskHistoryDto>>(sortedAssessments);

        return ApiResponse<List<CancerRiskHistoryDto>>.SuccessResponse(assessmentDtos);
    }

    public async Task<ApiResponse<CancerRiskResponseDto>> GetLatestBySmokerIdAsync(int smokerId)
    {
        var assessments = await _unitOfWork.Repository<CancerRiskAssessment>()
            .FindAsync(a => a.SmokerId == smokerId);

        var latestAssessment = assessments.OrderByDescending(a => a.AssessmentDate).FirstOrDefault();
        if (latestAssessment == null)
            return ApiResponse<CancerRiskResponseDto>.ErrorResponse("No assessments found");

        var assessmentDto = _mapper.Map<CancerRiskResponseDto>(latestAssessment);
        return ApiResponse<CancerRiskResponseDto>.SuccessResponse(assessmentDto);
    }

    private double CalculateBaseRisk(int age, int cigarettesPerDay, int yearsOfSmoking)
    {
        // Simplified risk calculation
        var packYears = (cigarettesPerDay / 20.0) * yearsOfSmoking;
        var ageFactor = age >= 50 ? 1.5 : 1.0;

        return Math.Min(packYears * 2 * ageFactor, 50);
    }

    private string GenerateRecommendations(RiskLevel riskLevel, CancerRiskRequestDto dto)
    {
        var recommendations = new List<string>();

        switch (riskLevel)
        {
            case RiskLevel.Low:
                recommendations.Add("Your lung cancer risk is relatively low.");
                recommendations.Add("Continue to maintain a healthy lifestyle.");
                recommendations.Add("Consider quitting smoking to further reduce your risk.");
                break;

            case RiskLevel.Medium:
                recommendations.Add("Your lung cancer risk is moderate.");
                recommendations.Add("We recommend scheduling a check-up with your primary care physician.");
                recommendations.Add("Consider getting a chest X-ray or CT scan.");
                recommendations.Add("Quitting smoking is highly recommended to reduce your risk.");
                break;

            case RiskLevel.High:
                recommendations.Add("Your lung cancer risk is HIGH. Immediate action is recommended.");
                recommendations.Add("Please consult with a respiratory specialist or oncologist as soon as possible.");
                recommendations.Add("Low-dose CT screening is strongly recommended.");
                recommendations.Add("Quitting smoking immediately is crucial to improve your health outcomes.");

                if (dto.HasBloodInCough || dto.HasPersistentCough)
                    recommendations.Add("Your symptoms require immediate medical attention.");
                break;
        }

        return string.Join(" ", recommendations);
    }
}
