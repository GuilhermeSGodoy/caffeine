using Caffeine.Domain;
using Microsoft.EntityFrameworkCore;

namespace Caffeine.Infrastructure;

public class NodeRepository(CaffeineDbContext dbContext) : INodeRepository
{
    public Task<List<Node>> GetTreeAsync(CancellationToken cancellationToken = default) =>
        dbContext.Nodes.AsNoTracking().ToListAsync(cancellationToken);

    public Task<Node?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        dbContext.Nodes.FirstOrDefaultAsync(n => n.Id == id, cancellationToken);

    public async Task AddAsync(Node node, CancellationToken cancellationToken = default) =>
        await dbContext.Nodes.AddAsync(node, cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        dbContext.SaveChangesAsync(cancellationToken);
}
