using Caffeine.Domain;
using Microsoft.EntityFrameworkCore;

namespace Caffeine.Infrastructure;

public class DocumentContentRepository(CaffeineDbContext dbContext) : IDocumentContentRepository
{
    public Task<DocumentContent?> GetByNodeIdAsync(Guid nodeId, CancellationToken cancellationToken = default) =>
        dbContext.DocumentContents.FirstOrDefaultAsync(d => d.NodeId == nodeId, cancellationToken);

    public async Task AddAsync(DocumentContent content, CancellationToken cancellationToken = default) =>
        await dbContext.DocumentContents.AddAsync(content, cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        dbContext.SaveChangesAsync(cancellationToken);
}
