namespace Caffeine.Infrastructure;

public class AppDataPathProvider : IAppDataPathProvider
{
    public string GetDatabasePath()
    {
        var dataDir = Environment.GetEnvironmentVariable("CAFFEINE_DATA_DIR");

        if (string.IsNullOrWhiteSpace(dataDir))
        {
            dataDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "Caffeine");
        }

        Directory.CreateDirectory(dataDir);

        return Path.Combine(dataDir, "caffeine.db");
    }
}
