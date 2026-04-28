using NoSmokeJourney.Core.Interfaces;
using NoSmokeJourney.Infrastructure.Data;
using System.Collections.Concurrent;

namespace NoSmokeJourney.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private readonly ConcurrentDictionary<Type, object> _repositories;
    private bool _disposed;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
        _repositories = new ConcurrentDictionary<Type, object>();
    }

    public IGenericRepository<T> Repository<T>() where T : class
    {
        var type = typeof(T);
        if (!_repositories.ContainsKey(type))
        {
            var repository = new GenericRepository<T>(_context);
            _repositories.TryAdd(type, repository);
        }
        return (IGenericRepository<T>)_repositories[type];
    }

    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing)
            {
                _context.Dispose();
            }
            _disposed = true;
        }
    }
}
