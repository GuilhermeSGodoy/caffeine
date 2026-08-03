using Caffeine.Domain;

namespace Caffeine.Tests;

public class WordCountCalculatorTests
{
    [Theory]
    [InlineData("", 0, 0)]
    [InlineData("   ", 0, 0)]
    [InlineData("Hello", 1, 5)]
    [InlineData("Hello world", 2, 10)]
    [InlineData("Hello   world\nnew line", 4, 17)]
    public void Count_ReturnsExpectedWordAndCharCounts(string text, int expectedWords, int expectedChars)
    {
        var (wordCount, charCount) = WordCountCalculator.Count(text);

        Assert.Equal(expectedWords, wordCount);
        Assert.Equal(expectedChars, charCount);
    }
}
