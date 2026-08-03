namespace Caffeine.Domain;

public interface IDocumentContentRepository
{
    Task<DocumentContent?> GetByNodeIdAsync(Guid nodeId, CancellationToken cancellationToken = default);
    Task AddAsync(DocumentContent content, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
