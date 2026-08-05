using Caffeine.Domain;

namespace Caffeine.Tests;

public class ThemeCatalogTests
{
    [Theory]
    [InlineData("aura")]
    [InlineData("caffeine")]
    [InlineData("tokyo")]
    [InlineData("darkwood")]
    [InlineData("latte")]
    public void IsValid_ReturnsTrue_ForKnownThemeIds(string themeId)
    {
        Assert.True(ThemeCatalog.IsValid(themeId));
    }

    [Theory]
    [InlineData("")]
    [InlineData("dark")]
    [InlineData("AURA")]
    [InlineData("unknown-theme")]
    public void IsValid_ReturnsFalse_ForUnknownThemeIds(string themeId)
    {
        Assert.False(ThemeCatalog.IsValid(themeId));
    }

    [Fact]
    public void DefaultThemeId_IsValid()
    {
        Assert.True(ThemeCatalog.IsValid(ThemeCatalog.DefaultThemeId));
    }
}
