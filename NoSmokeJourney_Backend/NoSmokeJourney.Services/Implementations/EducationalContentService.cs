using AutoMapper;
using NoSmokeJourney.Core.Entities;
using NoSmokeJourney.Core.Enums;
using NoSmokeJourney.Core.Interfaces;
using NoSmokeJourney.Services.DTOs;
using NoSmokeJourney.Services.Interfaces;

namespace NoSmokeJourney.Services.Implementations;

public class EducationalContentService : IEducationalContentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public EducationalContentService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<EducationalContentDto>> GetByIdAsync(int id)
    {
        var content = await _unitOfWork.Repository<EducationalContent>().GetByIdAsync(id);
        if (content == null)
            return ApiResponse<EducationalContentDto>.ErrorResponse("Content not found");

        var contentDto = _mapper.Map<EducationalContentDto>(content);
        return ApiResponse<EducationalContentDto>.SuccessResponse(contentDto);
    }

    public async Task<ApiResponse<List<EducationalContentDto>>> GetAllAsync()
    {
        var contents = await _unitOfWork.Repository<EducationalContent>().GetAllAsync();
        var activeContents = contents.Where(c => c.IsActive).OrderBy(c => c.DisplayOrder);
        var contentDtos = _mapper.Map<List<EducationalContentDto>>(activeContents);
        return ApiResponse<List<EducationalContentDto>>.SuccessResponse(contentDtos);
    }

    public async Task<ApiResponse<List<EducationalContentDto>>> GetByTypeAsync(string type)
    {
        if (!Enum.TryParse<ContentType>(type, true, out var contentType))
            return ApiResponse<List<EducationalContentDto>>.ErrorResponse("Invalid content type");

        var contents = await _unitOfWork.Repository<EducationalContent>()
            .FindAsync(c => c.Type == contentType && c.IsActive);

        var contentDtos = _mapper.Map<List<EducationalContentDto>>(contents.OrderBy(c => c.DisplayOrder));
        return ApiResponse<List<EducationalContentDto>>.SuccessResponse(contentDtos);
    }

    public async Task<ApiResponse<List<EducationalContentDto>>> GetByBodyOrganAsync(string bodyOrgan)
    {
        var contents = await _unitOfWork.Repository<EducationalContent>()
            .FindAsync(c => c.BodyOrgan != null &&
                           c.BodyOrgan.ToLower() == bodyOrgan.ToLower() &&
                           c.IsActive);

        var contentDtos = _mapper.Map<List<EducationalContentDto>>(contents.OrderBy(c => c.DisplayOrder));
        return ApiResponse<List<EducationalContentDto>>.SuccessResponse(contentDtos);
    }

    public async Task<ApiResponse<PagedResponse<EducationalContentDto>>> GetPagedAsync(PaginationParams paginationParams)
    {
        var query = await _unitOfWork.Repository<EducationalContent>().GetAllAsync();
        var contents = query.Where(c => c.IsActive).ToList();

        var totalCount = contents.Count;
        var pagedContents = contents
            .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
            .Take(paginationParams.PageSize)
            .ToList();

        var contentDtos = _mapper.Map<List<EducationalContentDto>>(pagedContents);

        var pagedResponse = new PagedResponse<EducationalContentDto>
        {
            Items = contentDtos,
            PageNumber = paginationParams.PageNumber,
            PageSize = paginationParams.PageSize,
            TotalCount = totalCount
        };

        return ApiResponse<PagedResponse<EducationalContentDto>>.SuccessResponse(pagedResponse);
    }

    public async Task<ApiResponse<EducationalContentDto>> CreateAsync(EducationalContentCreateDto dto)
    {
        var content = _mapper.Map<EducationalContent>(dto);
        await _unitOfWork.Repository<EducationalContent>().AddAsync(content);
        await _unitOfWork.CompleteAsync();

        var contentDto = _mapper.Map<EducationalContentDto>(content);
        return ApiResponse<EducationalContentDto>.SuccessResponse(contentDto, "Content created successfully");
    }

    public async Task<ApiResponse<EducationalContentDto>> UpdateAsync(int id, EducationalContentUpdateDto dto)
    {
        var content = await _unitOfWork.Repository<EducationalContent>().GetByIdAsync(id);
        if (content == null)
            return ApiResponse<EducationalContentDto>.ErrorResponse("Content not found");

        _mapper.Map(dto, content);
        content.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Repository<EducationalContent>().Update(content);
        await _unitOfWork.CompleteAsync();

        var contentDto = _mapper.Map<EducationalContentDto>(content);
        return ApiResponse<EducationalContentDto>.SuccessResponse(contentDto, "Content updated successfully");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var content = await _unitOfWork.Repository<EducationalContent>().GetByIdAsync(id);
        if (content == null)
            return ApiResponse<bool>.ErrorResponse("Content not found");

        _unitOfWork.Repository<EducationalContent>().Delete(content);
        await _unitOfWork.CompleteAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Content deleted successfully");
    }

    public async Task<ApiResponse<bool>> IncrementViewCountAsync(int id)
    {
        var content = await _unitOfWork.Repository<EducationalContent>().GetByIdAsync(id);
        if (content == null)
            return ApiResponse<bool>.ErrorResponse("Content not found");

        content.ViewCount++;
        _unitOfWork.Repository<EducationalContent>().Update(content);
        await _unitOfWork.CompleteAsync();

        return ApiResponse<bool>.SuccessResponse(true);
    }
}
