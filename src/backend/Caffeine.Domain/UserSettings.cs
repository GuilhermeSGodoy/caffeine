namespace Caffeine.Domain;

public class UserSettings
{
    public const int SingletonId = 1;

    public int Id { get; set; } = SingletonId;
    public string Theme { get; set; } = ThemeCatalog.DefaultThemeId;
}
