using System.Linq.Expressions;

namespace NoSmokeJourney.Core.Interfaces;

public interface IGenericRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync(Func<IQueryable<T>, IQueryable<T>>? include = null);
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> expression, Func<IQueryable<T>, IQueryable<T>>? include = null);
    Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> expression, Func<IQueryable<T>, IQueryable<T>>? include = null);
    Task<bool> AnyAsync(Expression<Func<T, bool>> expression);
    Task<int> CountAsync(Expression<Func<T, bool>>? expression = null);
    Task AddAsync(T entity);
    Task AddRangeAsync(IEnumerable<T> entities);
    void Update(T entity);
    void Delete(T entity);
    void DeleteRange(IEnumerable<T> entities);
}
