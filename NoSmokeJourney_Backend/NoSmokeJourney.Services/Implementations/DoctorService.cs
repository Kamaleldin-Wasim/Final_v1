using AutoMapper;
using Microsoft.EntityFrameworkCore;
using NoSmokeJourney.Core.Entities;
using NoSmokeJourney.Core.Interfaces;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.Services.Implementations;

public class DoctorService : IDoctorService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DoctorService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<DoctorDto>> GetByIdAsync(int id)
    {
        var doctors = await _unitOfWork.Repository<Doctor>().FindAsync(d => d.Id == id, 
            q => q.Include(d => d.User).Include(d => d.MedicalCenter));
        
        var doctor = doctors.FirstOrDefault();
        if (doctor == null)
            return ApiResponse<DoctorDto>.ErrorResponse("Doctor not found");
 
        var doctorDto = _mapper.Map<DoctorDto>(doctor);
        return ApiResponse<DoctorDto>.SuccessResponse(doctorDto);
    }
 
    public async Task<ApiResponse<List<DoctorDto>>> GetAllAsync()
    {
        var doctors = await _unitOfWork.Repository<Doctor>().GetAllAsync(
            q => q.Include(d => d.User).Include(d => d.MedicalCenter));
            
        var doctorDtos = _mapper.Map<List<DoctorDto>>(doctors);
        return ApiResponse<List<DoctorDto>>.SuccessResponse(doctorDtos);
    }
 
    public async Task<ApiResponse<PagedResponse<DoctorDto>>> GetPagedAsync(PaginationParams paginationParams)
    {
        var doctors = await _unitOfWork.Repository<Doctor>().GetAllAsync(
            q => q.Include(d => d.User).Include(d => d.MedicalCenter));
            
        var doctorList = doctors.ToList();
 
        var totalCount = doctorList.Count;
        var pagedDoctors = doctorList
            .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
            .Take(paginationParams.PageSize)
            .ToList();
 
        var doctorDtos = _mapper.Map<List<DoctorDto>>(pagedDoctors);

        var pagedResponse = new PagedResponse<DoctorDto>
        {
            Items = doctorDtos,
            PageNumber = paginationParams.PageNumber,
            PageSize = paginationParams.PageSize,
            TotalCount = totalCount
        };

        return ApiResponse<PagedResponse<DoctorDto>>.SuccessResponse(pagedResponse);
    }

    public async Task<ApiResponse<List<DoctorDto>>> GetByFilterAsync(DoctorFilterDto filter)
    {
        var doctors = await _unitOfWork.Repository<Doctor>().GetAllAsync(
            q => q.Include(d => d.User).Include(d => d.MedicalCenter));
            
        var query = doctors.AsQueryable();

        if (!string.IsNullOrEmpty(filter.Location))
            query = query.Where(d => d.Location.Contains(filter.Location, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrEmpty(filter.Specialization))
            query = query.Where(d => d.Specialization.Contains(filter.Specialization, StringComparison.OrdinalIgnoreCase));

        if (filter.MinRating.HasValue)
            query = query.Where(d => d.Rating >= filter.MinRating.Value);

        var filteredDoctors = query.ToList();
        var doctorDtos = _mapper.Map<List<DoctorDto>>(filteredDoctors);

        return ApiResponse<List<DoctorDto>>.SuccessResponse(doctorDtos);
    }

    public async Task<ApiResponse<DoctorDto>> CreateAsync(DoctorCreateDto dto)
    {
        // First check if email already exists
        var existingUser = await _unitOfWork.Repository<User>().FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
        if (existingUser != null)
            return ApiResponse<DoctorDto>.ErrorResponse("Email already registered");

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = NoSmokeJourney.Core.Enums.UserRole.Doctor,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        
        await _unitOfWork.Repository<User>().AddAsync(user);
        await _unitOfWork.CompleteAsync();

        var doctor = new Doctor
        {
            UserId = user.Id,
            Specialization = dto.Specialization,
            Location = dto.Location,
            ContactInfo = dto.ContactInfo,
            About = dto.About,
            ImageUrl = dto.ImageUrl,
            MedicalCenterId = dto.MedicalCenterId
        };

        await _unitOfWork.Repository<Doctor>().AddAsync(doctor);
        await _unitOfWork.CompleteAsync();

        var doctorDto = _mapper.Map<DoctorDto>(doctor);
        doctorDto.Name = user.Name;
        doctorDto.Email = user.Email;
        
        return ApiResponse<DoctorDto>.SuccessResponse(doctorDto, "Doctor created successfully");
    }

    public async Task<ApiResponse<DoctorDto>> UpdateAsync(int id, DoctorUpdateDto dto)
    {
        var doctor = await _unitOfWork.Repository<Doctor>().GetByIdAsync(id);
        if (doctor == null)
            return ApiResponse<DoctorDto>.ErrorResponse("Doctor not found");

        _mapper.Map(dto, doctor);
        doctor.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Repository<Doctor>().Update(doctor);
        await _unitOfWork.CompleteAsync();

        var doctorDto = _mapper.Map<DoctorDto>(doctor);
        return ApiResponse<DoctorDto>.SuccessResponse(doctorDto, "Doctor updated successfully");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var doctor = await _unitOfWork.Repository<Doctor>().GetByIdAsync(id);
        if (doctor == null)
            return ApiResponse<bool>.ErrorResponse("Doctor not found");

        _unitOfWork.Repository<Doctor>().Delete(doctor);
        await _unitOfWork.CompleteAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Doctor deleted successfully");
    }

    public async Task<ApiResponse<double>> GetAverageRatingAsync(int doctorId)
    {
        var reviews = await _unitOfWork.Repository<DoctorReview>()
            .FindAsync(r => r.DoctorId == doctorId);

        if (!reviews.Any())
            return ApiResponse<double>.SuccessResponse(0, "No reviews yet");

        var averageRating = reviews.Average(r => r.Rating);
        return ApiResponse<double>.SuccessResponse(averageRating);
    }
}
