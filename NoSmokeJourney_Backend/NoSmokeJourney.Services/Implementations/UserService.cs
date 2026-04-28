using AutoMapper;
using Microsoft.EntityFrameworkCore;
using NoSmokeJourney.Core.Entities;
using NoSmokeJourney.Core.Interfaces;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.Services.Implementations;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UserService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<UserDto>> GetByIdAsync(int id)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(id);
        if (user == null)
            return ApiResponse<UserDto>.ErrorResponse("User not found");

        var userDto = _mapper.Map<UserDto>(user);
        return ApiResponse<UserDto>.SuccessResponse(userDto);
    }

    public async Task<ApiResponse<UserDto>> GetByEmailAsync(string email)
    {
        var user = await _unitOfWork.Repository<User>()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

        if (user == null)
            return ApiResponse<UserDto>.ErrorResponse("User not found");

        var userDto = _mapper.Map<UserDto>(user);
        return ApiResponse<UserDto>.SuccessResponse(userDto);
    }

    public async Task<ApiResponse<List<UserDto>>> GetAllAsync()
    {
        var users = await _unitOfWork.Repository<User>().GetAllAsync();
        var userDtos = _mapper.Map<List<UserDto>>(users);
        return ApiResponse<List<UserDto>>.SuccessResponse(userDtos);
    }

    public async Task<ApiResponse<PagedResponse<UserDto>>> GetPagedAsync(PaginationParams paginationParams)
    {
        var query = await _unitOfWork.Repository<User>().GetAllAsync();
        var users = query.ToList();

        var totalCount = users.Count;
        var pagedUsers = users
            .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
            .Take(paginationParams.PageSize)
            .ToList();

        var userDtos = _mapper.Map<List<UserDto>>(pagedUsers);

        var pagedResponse = new PagedResponse<UserDto>
        {
            Items = userDtos,
            PageNumber = paginationParams.PageNumber,
            PageSize = paginationParams.PageSize,
            TotalCount = totalCount
        };

        return ApiResponse<PagedResponse<UserDto>>.SuccessResponse(pagedResponse);
    }

    public async Task<ApiResponse<UserDto>> UpdateAsync(int id, UserUpdateDto dto)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(id);
        if (user == null)
            return ApiResponse<UserDto>.ErrorResponse("User not found");

        _mapper.Map(dto, user);
        user.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Repository<User>().Update(user);
        await _unitOfWork.CompleteAsync();

        var userDto = _mapper.Map<UserDto>(user);
        return ApiResponse<UserDto>.SuccessResponse(userDto, "User updated successfully");
    }

    public async Task<ApiResponse<UserDto>> CompleteProfileAsync(int userId, UserProfileCompleteDto dto)
    {
        var user = await _unitOfWork.Repository<User>()
            .FirstOrDefaultAsync(u => u.Id == userId, include: q => q.Include(u => u.SmokerProfile));

        if (user == null)
            return ApiResponse<UserDto>.ErrorResponse("User not found");

        user.Name = dto.FullName;
        user.Email = dto.Email;
        user.UpdatedAt = DateTime.UtcNow;

        if (user.SmokerProfile == null)
        {
            user.SmokerProfile = new Smoker
            {
                UserId = userId,
                Age = dto.Age,
                Gender = dto.Gender,
                CigarettesPerDay = dto.CigarettesPerDay,
                YearsOfSmoking = dto.YearsOfSmoking,
                MedicalHistory = dto.MedicalHistory,
                FamilyDiseases = dto.FamilyDiseases,
                PreviousQuitAttempts = dto.QuitAttempts,
                CreatedAt = DateTime.UtcNow
            };
        }
        else
        {
            user.SmokerProfile.Age = dto.Age;
            user.SmokerProfile.Gender = dto.Gender;
            user.SmokerProfile.CigarettesPerDay = dto.CigarettesPerDay;
            user.SmokerProfile.YearsOfSmoking = dto.YearsOfSmoking;
            user.SmokerProfile.MedicalHistory = dto.MedicalHistory;
            user.SmokerProfile.FamilyDiseases = dto.FamilyDiseases;
            user.SmokerProfile.PreviousQuitAttempts = dto.QuitAttempts;
            user.SmokerProfile.UpdatedAt = DateTime.UtcNow;
        }

        _unitOfWork.Repository<User>().Update(user);
        await _unitOfWork.CompleteAsync();

        var userDto = _mapper.Map<UserDto>(user);
        return ApiResponse<UserDto>.SuccessResponse(userDto, "Profile completed successfully");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(id);
        if (user == null)
            return ApiResponse<bool>.ErrorResponse("User not found");

        _unitOfWork.Repository<User>().Delete(user);
        await _unitOfWork.CompleteAsync();

        return ApiResponse<bool>.SuccessResponse(true, "User deleted successfully");
    }

    public async Task<ApiResponse<bool>> ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        if (user == null)
            return ApiResponse<bool>.ErrorResponse("User not found");

        // Verify current password (using BCrypt)
        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            return ApiResponse<bool>.ErrorResponse("Current password is incorrect");

        // Hash new password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Repository<User>().Update(user);
        await _unitOfWork.CompleteAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Password changed successfully");
    }
}
