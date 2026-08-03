namespace Caffeine.Domain;

public interface INodeRepository
{
    Task<List<Node>> GetTreeAsync(CancellationToken cancellationToken = default);
    Task<Node?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Node node, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
