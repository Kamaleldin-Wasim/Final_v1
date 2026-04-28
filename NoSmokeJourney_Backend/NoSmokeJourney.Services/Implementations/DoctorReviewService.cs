using AutoMapper;
using NoSmokeJourney.Core.Entities;
using NoSmokeJourney.Core.Interfaces;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.Services.Implementations;

public class DoctorReviewService : IDoctorReviewService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DoctorReviewService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<DoctorReviewDto>> GetByIdAsync(int id)
    {
        var review = await _unitOfWork.Repository<DoctorReview>().GetByIdAsync(id);
        if (review == null)
            return ApiResponse<DoctorReviewDto>.ErrorResponse("Review not found");

        var reviewDto = _mapper.Map<DoctorReviewDto>(review);
        return ApiResponse<DoctorReviewDto>.SuccessResponse(reviewDto);
    }

    public async Task<ApiResponse<List<DoctorReviewDto>>> GetByDoctorIdAsync(int doctorId)
    {
        var reviews = await _unitOfWork.Repository<DoctorReview>()
            .FindAsync(r => r.DoctorId == doctorId);

        var reviewDtos = _mapper.Map<List<DoctorReviewDto>>(reviews);
        return ApiResponse<List<DoctorReviewDto>>.SuccessResponse(reviewDtos);
    }

    public async Task<ApiResponse<List<DoctorReviewDto>>> GetByUserIdAsync(int userId)
    {
        var reviews = await _unitOfWork.Repository<DoctorReview>()
            .FindAsync(r => r.UserId == userId);

        var reviewDtos = _mapper.Map<List<DoctorReviewDto>>(reviews);
        return ApiResponse<List<DoctorReviewDto>>.SuccessResponse(reviewDtos);
    }

    public async Task<ApiResponse<DoctorReviewDto>> CreateAsync(int userId, DoctorReviewCreateDto dto)
    {
        // Check if user already reviewed this doctor
        var existingReview = await _unitOfWork.Repository<DoctorReview>()
            .FirstOrDefaultAsync(r => r.UserId == userId && r.DoctorId == dto.DoctorId);

        if (existingReview != null)
            return ApiResponse<DoctorReviewDto>.ErrorResponse("You have already reviewed this doctor");

        var review = _mapper.Map<DoctorReview>(dto);
        review.UserId = userId;
        review.ReviewDate = DateTime.UtcNow;

        await _unitOfWork.Repository<DoctorReview>().AddAsync(review);
        await _unitOfWork.CompleteAsync();

        // Update doctor's average rating
        await UpdateDoctorRatingAsync(dto.DoctorId);

        var reviewDto = _mapper.Map<DoctorReviewDto>(review);
        return ApiResponse<DoctorReviewDto>.SuccessResponse(reviewDto, "Review submitted successfully");
    }

    public async Task<ApiResponse<DoctorReviewDto>> UpdateAsync(int id, DoctorReviewUpdateDto dto)
    {
        var review = await _unitOfWork.Repository<DoctorReview>().GetByIdAsync(id);
        if (review == null)
            return ApiResponse<DoctorReviewDto>.ErrorResponse("Review not found");

        _mapper.Map(dto, review);
        review.ReviewDate = DateTime.UtcNow;

        _unitOfWork.Repository<DoctorReview>().Update(review);
        await _unitOfWork.CompleteAsync();

        // Update doctor's average rating
        await UpdateDoctorRatingAsync(review.DoctorId);

        var reviewDto = _mapper.Map<DoctorReviewDto>(review);
        return ApiResponse<DoctorReviewDto>.SuccessResponse(reviewDto, "Review updated successfully");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var review = await _unitOfWork.Repository<DoctorReview>().GetByIdAsync(id);
        if (review == null)
            return ApiResponse<bool>.ErrorResponse("Review not found");

        var doctorId = review.DoctorId;

        _unitOfWork.Repository<DoctorReview>().Delete(review);
        await _unitOfWork.CompleteAsync();

        // Update doctor's average rating
        await UpdateDoctorRatingAsync(doctorId);

        return ApiResponse<bool>.SuccessResponse(true, "Review deleted successfully");
    }

    private async Task UpdateDoctorRatingAsync(int doctorId)
    {
        var reviews = await _unitOfWork.Repository<DoctorReview>()
            .FindAsync(r => r.DoctorId == doctorId);

        var doctor = await _unitOfWork.Repository<Doctor>().GetByIdAsync(doctorId);
        if (doctor != null)
        {
            doctor.Rating = reviews.Any() ? reviews.Average(r => r.Rating) : 0;
            _unitOfWork.Repository<Doctor>().Update(doctor);
            await _unitOfWork.CompleteAsync();
        }
    }
}
