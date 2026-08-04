using Caffeine.Domain;
using Microsoft.EntityFrameworkCore;

namespace Caffeine.Infrastructure;

public class UserSettingsRepository(CaffeineDbContext dbContext) : IUserSettingsRepository
{
    public Task<UserSettings?> GetAsync(CancellationToken cancellationToken = default) =>
        dbContext.UserSettings.FirstOrDefaultAsync(s => s.Id == UserSettings.SingletonId, cancellationToken);

    public async Task AddAsync(UserSettings settings, CancellationToken cancellationToken = default) =>
        await dbContext.UserSettings.AddAsync(settings, cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        dbContext.SaveChangesAsync(cancellationToken);
}
