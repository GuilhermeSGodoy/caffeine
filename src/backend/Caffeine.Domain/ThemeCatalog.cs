namespace Caffeine.Domain;

public static class ThemeCatalog
{
    public const string DefaultThemeId = "aura";

    private static readonly IReadOnlySet<string> ValidThemeIds = new HashSet<string>
    {
        "aura",
        "caffeine",
        "tokyo",
        "darkwood",
        "latte",
    };

    public static bool IsValid(string themeId) => ValidThemeIds.Contains(themeId);
}
