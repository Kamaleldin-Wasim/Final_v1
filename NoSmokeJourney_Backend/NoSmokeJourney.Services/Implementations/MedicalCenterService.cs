using AutoMapper;
using Microsoft.EntityFrameworkCore;
using NoSmokeJourney.Core.Entities;
using NoSmokeJourney.Core.Interfaces;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.Services.Implementations;

public class MedicalCenterService : IMedicalCenterService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public MedicalCenterService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<MedicalCenterDto>> GetByIdAsync(int id)
    {
        var centers = await _unitOfWork.Repository<MedicalCenter>().FindAsync(c => c.Id == id,
            q => q.Include(c => c.Doctors));
            
        var center = centers.FirstOrDefault();
        if (center == null)
            return ApiResponse<MedicalCenterDto>.ErrorResponse("Medical center not found");
 
        var centerDto = _mapper.Map<MedicalCenterDto>(center);
        return ApiResponse<MedicalCenterDto>.SuccessResponse(centerDto);
    }
 
    public async Task<ApiResponse<List<MedicalCenterDto>>> GetAllAsync()
    {
        var centers = await _unitOfWork.Repository<MedicalCenter>().GetAllAsync(
            q => q.Include(c => c.Doctors));
            
        var centerDtos = _mapper.Map<List<MedicalCenterDto>>(centers);
        return ApiResponse<List<MedicalCenterDto>>.SuccessResponse(centerDtos);
    }
 
    public async Task<ApiResponse<PagedResponse<MedicalCenterDto>>> GetPagedAsync(PaginationParams paginationParams)
    {
        var centers = await _unitOfWork.Repository<MedicalCenter>().GetAllAsync(
            q => q.Include(c => c.Doctors));
            
        var centerList = centers.ToList();
 
        var totalCount = centerList.Count;
        var pagedCenters = centerList
            .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
            .Take(paginationParams.PageSize)
            .ToList();
 
        var centerDtos = _mapper.Map<List<MedicalCenterDto>>(pagedCenters);

        var pagedResponse = new PagedResponse<MedicalCenterDto>
        {
            Items = centerDtos,
            PageNumber = paginationParams.PageNumber,
            PageSize = paginationParams.PageSize,
            TotalCount = totalCount
        };

        return ApiResponse<PagedResponse<MedicalCenterDto>>.SuccessResponse(pagedResponse);
    }

    public async Task<ApiResponse<MedicalCenterDto>> CreateAsync(MedicalCenterCreateDto dto)
    {
        var center = _mapper.Map<MedicalCenter>(dto);
        await _unitOfWork.Repository<MedicalCenter>().AddAsync(center);
        await _unitOfWork.CompleteAsync();

        var centerDto = _mapper.Map<MedicalCenterDto>(center);
        return ApiResponse<MedicalCenterDto>.SuccessResponse(centerDto, "Medical center created successfully");
    }

    public async Task<ApiResponse<MedicalCenterDto>> UpdateAsync(int id, MedicalCenterUpdateDto dto)
    {
        var center = await _unitOfWork.Repository<MedicalCenter>().GetByIdAsync(id);
        if (center == null)
            return ApiResponse<MedicalCenterDto>.ErrorResponse("Medical center not found");

        _mapper.Map(dto, center);
        center.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Repository<MedicalCenter>().Update(center);
        await _unitOfWork.CompleteAsync();

        var centerDto = _mapper.Map<MedicalCenterDto>(center);
        return ApiResponse<MedicalCenterDto>.SuccessResponse(centerDto, "Medical center updated successfully");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var center = await _unitOfWork.Repository<MedicalCenter>().GetByIdAsync(id);
        if (center == null)
            return ApiResponse<bool>.ErrorResponse("Medical center not found");

        _unitOfWork.Repository<MedicalCenter>().Delete(center);
        await _unitOfWork.CompleteAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Medical center deleted successfully");
    }

    public async Task<ApiResponse<List<MedicalCenterDto>>> GetNearbyAsync(double latitude, double longitude, double radiusKm)
    {
        var centers = await _unitOfWork.Repository<MedicalCenter>().GetAllAsync();

        // Simple distance calculation using Haversine formula approximation
        var nearbyCenters = centers.Where(c =>
        {
            if (!c.Latitude.HasValue || !c.Longitude.HasValue)
                return false;

            var distance = CalculateDistance(latitude, longitude, c.Latitude.Value, c.Longitude.Value);
            return distance <= radiusKm;
        }).ToList();

        var centerDtos = _mapper.Map<List<MedicalCenterDto>>(nearbyCenters);
        return ApiResponse<List<MedicalCenterDto>>.SuccessResponse(centerDtos);
    }

    private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371; // Earth's radius in kilometers

        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return R * c;
    }

    private double ToRadians(double degrees)
    {
        return degrees * Math.PI / 180;
    }
}
