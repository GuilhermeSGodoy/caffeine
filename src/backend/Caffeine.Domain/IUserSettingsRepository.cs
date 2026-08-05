namespace Caffeine.Domain;

public interface IUserSettingsRepository
{
    Task<UserSettings?> GetAsync(CancellationToken cancellationToken = default);
    Task AddAsync(UserSettings settings, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
