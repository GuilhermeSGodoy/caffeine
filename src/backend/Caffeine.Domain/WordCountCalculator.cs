using System.Text.RegularExpressions;

namespace Caffeine.Domain;

public static partial class WordCountCalculator
{
    public static (int WordCount, int CharCount) Count(string plainText)
    {
        if (string.IsNullOrWhiteSpace(plainText))
        {
            return (0, 0);
        }

        var wordCount = WordPattern().Matches(plainText).Count;
        var charCount = WhitespacePattern().Replace(plainText, string.Empty).Length;

        return (wordCount, charCount);
    }

    [GeneratedRegex(@"\S+")]
    private static partial Regex WordPattern();

    [GeneratedRegex(@"\s")]
    private static partial Regex WhitespacePattern();
}
