using AutoMapper;
using NoSmokeJourney.Core.Entities;
using NoSmokeJourney.Core.Enums;
using NoSmokeJourney.Services.DTOs;

namespace NoSmokeJourney.Services.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User Mappings
        CreateMap<User, UserDto>();
        CreateMap<UserRegisterDto, User>()
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore());
        CreateMap<UserUpdateDto, User>();

        // Smoker Mappings
        CreateMap<Smoker, SmokerDto>();
        CreateMap<SmokerCreateDto, Smoker>();
        CreateMap<SmokerUpdateDto, Smoker>();

        // Doctor Mappings
        CreateMap<Doctor, DoctorDto>()
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.User.Name))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email))
            .ForMember(dest => dest.ReviewCount, opt => opt.MapFrom(src => src.Reviews.Count));
        CreateMap<DoctorCreateDto, Doctor>();
        CreateMap<DoctorUpdateDto, Doctor>();

        // Medical Center Mappings
        CreateMap<MedicalCenter, MedicalCenterDto>()
            .ForMember(dest => dest.DoctorCount, opt => opt.MapFrom(src => src.Doctors.Count));
        CreateMap<MedicalCenterCreateDto, MedicalCenter>();
        CreateMap<MedicalCenterUpdateDto, MedicalCenter>();

        // Seminar Mappings
        CreateMap<Seminar, SeminarDto>();
        CreateMap<SeminarCreateDto, Seminar>();
        CreateMap<SeminarUpdateDto, Seminar>();

        // Seminar Registration Mappings
        CreateMap<SeminarRegistration, SeminarRegistrationDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.Name))
            .ForMember(dest => dest.SeminarTitle, opt => opt.MapFrom(src => src.Seminar.Title))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
        CreateMap<RegisterForSeminarDto, SeminarRegistration>();

        // Recovery Story Mappings
        CreateMap<RecoveryStory, RecoveryStoryDto>()
            .ForMember(dest => dest.AuthorName, opt => opt.MapFrom(src => src.User.Name))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
        CreateMap<RecoveryStoryCreateDto, RecoveryStory>();
        CreateMap<RecoveryStoryUpdateDto, RecoveryStory>();

        // Doctor Review Mappings
        CreateMap<DoctorReview, DoctorReviewDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.Name))
            .ForMember(dest => dest.DoctorName, opt => opt.MapFrom(src => src.Doctor.User.Name));
        CreateMap<DoctorReviewCreateDto, DoctorReview>();
        CreateMap<DoctorReviewUpdateDto, DoctorReview>();

        // Addiction Test Mappings
        CreateMap<AddictionTest, AddictionTestResponseDto>()
            .ForMember(dest => dest.AddictionLevelText, opt => opt.MapFrom(src => src.AddictionLevel.ToString()));
        CreateMap<AddictionTest, AddictionTestHistoryDto>()
            .ForMember(dest => dest.AddictionLevel, opt => opt.MapFrom(src => src.AddictionLevel.ToString()));
        CreateMap<AddictionTestRequestDto, AddictionTest>();

        // Cancer Risk Mappings
        CreateMap<CancerRiskAssessment, CancerRiskResponseDto>()
            .ForMember(dest => dest.RiskLevelText, opt => opt.MapFrom(src => src.RiskLevel.ToString()));
        CreateMap<CancerRiskAssessment, CancerRiskHistoryDto>()
            .ForMember(dest => dest.RiskLevel, opt => opt.MapFrom(src => src.RiskLevel.ToString()));
        CreateMap<CancerRiskRequestDto, CancerRiskAssessment>();

        // Progress Tracker Mappings
        CreateMap<ProgressTracker, ProgressTrackerDto>();

        // Educational Content Mappings
        CreateMap<EducationalContent, EducationalContentDto>()
            .ForMember(dest => dest.TypeText, opt => opt.MapFrom(src => src.Type.ToString()));
        CreateMap<EducationalContentCreateDto, EducationalContent>();
        CreateMap<EducationalContentUpdateDto, EducationalContent>();

        // Health Milestone Mappings
        CreateMap<HealthMilestone, HealthMilestoneDto>()
            .ForMember(dest => dest.TimeAfterQuitText, opt => opt.MapFrom(src => FormatTimeSpan(src.TimeAfterQuit)));
        CreateMap<HealthMilestoneCreateDto, HealthMilestone>();
        CreateMap<HealthMilestoneUpdateDto, HealthMilestone>();
    }

    private static string FormatTimeSpan(TimeSpan timeSpan)
    {
        if (timeSpan.TotalMinutes < 60)
            return $"{timeSpan.TotalMinutes} minutes";
        if (timeSpan.TotalHours < 24)
            return $"{timeSpan.TotalHours} hours";
        if (timeSpan.TotalDays < 30)
            return $"{timeSpan.TotalDays} days";
        if (timeSpan.TotalDays < 365)
            return $"{timeSpan.TotalDays / 30} months";
        return $"{timeSpan.TotalDays / 365} years";
    }
}
