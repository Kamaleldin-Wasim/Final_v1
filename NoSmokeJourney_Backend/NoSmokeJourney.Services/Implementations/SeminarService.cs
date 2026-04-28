using AutoMapper;
using NoSmokeJourney.Core.Entities;
using NoSmokeJourney.Core.Enums;
using NoSmokeJourney.Core.Interfaces;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.Services.Implementations;

public class SeminarService : ISeminarService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public SeminarService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<SeminarDto>> GetByIdAsync(int id)
    {
        var seminar = await _unitOfWork.Repository<Seminar>().GetByIdAsync(id);
        if (seminar == null)
            return ApiResponse<SeminarDto>.ErrorResponse("Seminar not found");

        var seminarDto = _mapper.Map<SeminarDto>(seminar);
        return ApiResponse<SeminarDto>.SuccessResponse(seminarDto);
    }

    public async Task<ApiResponse<List<SeminarDto>>> GetAllAsync()
    {
        var seminars = await _unitOfWork.Repository<Seminar>().GetAllAsync();
        var seminarDtos = _mapper.Map<List<SeminarDto>>(seminars);
        return ApiResponse<List<SeminarDto>>.SuccessResponse(seminarDtos);
    }

    public async Task<ApiResponse<List<SeminarDto>>> GetUpcomingAsync()
    {
        var seminars = await _unitOfWork.Repository<Seminar>()
            .FindAsync(s => s.Date >= DateTime.UtcNow && s.IsActive);

        var seminarDtos = _mapper.Map<List<SeminarDto>>(seminars);
        return ApiResponse<List<SeminarDto>>.SuccessResponse(seminarDtos);
    }

    public async Task<ApiResponse<PagedResponse<SeminarDto>>> GetPagedAsync(PaginationParams paginationParams)
    {
        var query = await _unitOfWork.Repository<Seminar>().GetAllAsync();
        var seminars = query.ToList();

        var totalCount = seminars.Count;
        var pagedSeminars = seminars
            .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
            .Take(paginationParams.PageSize)
            .ToList();

        var seminarDtos = _mapper.Map<List<SeminarDto>>(pagedSeminars);

        var pagedResponse = new PagedResponse<SeminarDto>
        {
            Items = seminarDtos,
            PageNumber = paginationParams.PageNumber,
            PageSize = paginationParams.PageSize,
            TotalCount = totalCount
        };

        return ApiResponse<PagedResponse<SeminarDto>>.SuccessResponse(pagedResponse);
    }

    public async Task<ApiResponse<SeminarDto>> CreateAsync(SeminarCreateDto dto)
    {
        var seminar = _mapper.Map<Seminar>(dto);
        await _unitOfWork.Repository<Seminar>().AddAsync(seminar);
        await _unitOfWork.CompleteAsync();

        var seminarDto = _mapper.Map<SeminarDto>(seminar);
        return ApiResponse<SeminarDto>.SuccessResponse(seminarDto, "Seminar created successfully");
    }

    public async Task<ApiResponse<SeminarDto>> UpdateAsync(int id, SeminarUpdateDto dto)
    {
        var seminar = await _unitOfWork.Repository<Seminar>().GetByIdAsync(id);
        if (seminar == null)
            return ApiResponse<SeminarDto>.ErrorResponse("Seminar not found");

        _mapper.Map(dto, seminar);
        seminar.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Repository<Seminar>().Update(seminar);
        await _unitOfWork.CompleteAsync();

        var seminarDto = _mapper.Map<SeminarDto>(seminar);
        return ApiResponse<SeminarDto>.SuccessResponse(seminarDto, "Seminar updated successfully");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var seminar = await _unitOfWork.Repository<Seminar>().GetByIdAsync(id);
        if (seminar == null)
            return ApiResponse<bool>.ErrorResponse("Seminar not found");

        _unitOfWork.Repository<Seminar>().Delete(seminar);
        await _unitOfWork.CompleteAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Seminar deleted successfully");
    }

    public async Task<ApiResponse<SeminarRegistrationDto>> RegisterAsync(int userId, RegisterForSeminarDto dto)
    {
        var seminar = await _unitOfWork.Repository<Seminar>().GetByIdAsync(dto.SeminarId);
        if (seminar == null)
            return ApiResponse<SeminarRegistrationDto>.ErrorResponse("Seminar not found");

        if (seminar.CurrentAttendees >= seminar.MaxAttendees)
            return ApiResponse<SeminarRegistrationDto>.ErrorResponse("Seminar is fully booked");

        // Check if already registered
        var existingRegistration = await _unitOfWork.Repository<SeminarRegistration>()
            .FirstOrDefaultAsync(r => r.UserId == userId && r.SeminarId == dto.SeminarId);

        if (existingRegistration != null)
            return ApiResponse<SeminarRegistrationDto>.ErrorResponse("Already registered for this seminar");

        var registration = new SeminarRegistration
        {
            UserId = userId,
            SeminarId = dto.SeminarId,
            Notes = dto.Notes,
            Status = RegistrationStatus.Confirmed,
            RegistrationDate = DateTime.UtcNow
        };

        await _unitOfWork.Repository<SeminarRegistration>().AddAsync(registration);

        // Update seminar attendee count
        seminar.CurrentAttendees++;
        _unitOfWork.Repository<Seminar>().Update(seminar);

        await _unitOfWork.CompleteAsync();

        // Load related entities for mapping
        registration.User = await _unitOfWork.Repository<User>().GetByIdAsync(userId) ?? null!;
        registration.Seminar = seminar;

        var registrationDto = _mapper.Map<SeminarRegistrationDto>(registration);
        return ApiResponse<SeminarRegistrationDto>.SuccessResponse(registrationDto, "Registration successful");
    }

    public async Task<ApiResponse<bool>> CancelRegistrationAsync(int registrationId)
    {
        var registration = await _unitOfWork.Repository<SeminarRegistration>().GetByIdAsync(registrationId);
        if (registration == null)
            return ApiResponse<bool>.ErrorResponse("Registration not found");

        registration.Status = RegistrationStatus.Cancelled;
        _unitOfWork.Repository<SeminarRegistration>().Update(registration);

        // Update seminar attendee count
        var seminar = await _unitOfWork.Repository<Seminar>().GetByIdAsync(registration.SeminarId);
        if (seminar != null && seminar.CurrentAttendees > 0)
        {
            seminar.CurrentAttendees--;
            _unitOfWork.Repository<Seminar>().Update(seminar);
        }

        await _unitOfWork.CompleteAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Registration cancelled successfully");
    }

    public async Task<ApiResponse<List<SeminarRegistrationDto>>> GetUserRegistrationsAsync(int userId)
    {
        var registrations = await _unitOfWork.Repository<SeminarRegistration>()
            .FindAsync(r => r.UserId == userId);

        var registrationDtos = _mapper.Map<List<SeminarRegistrationDto>>(registrations);
        return ApiResponse<List<SeminarRegistrationDto>>.SuccessResponse(registrationDtos);
    }
}
