using Caffeine.Domain;

namespace Caffeine.Tests;

public class ContentTextExtractorTests
{
    [Fact]
    public void ExtractPlainText_EmptyDocument_ReturnsEmptyString()
    {
        var result = ContentTextExtractor.ExtractPlainText("{\"type\":\"doc\",\"content\":[]}");

        Assert.Equal(string.Empty, result);
    }

    [Fact]
    public void ExtractPlainText_SingleParagraph_ReturnsItsText()
    {
        const string json = """
        {
          "type": "doc",
          "content": [
            { "type": "paragraph", "content": [ { "type": "text", "text": "Olá mundo" } ] }
          ]
        }
        """;

        var result = ContentTextExtractor.ExtractPlainText(json);

        Assert.Equal("Olá mundo", result);
    }

    [Fact]
    public void ExtractPlainText_MultipleParagraphs_ConcatenatesAllText()
    {
        const string json = """
        {
          "type": "doc",
          "content": [
            { "type": "paragraph", "content": [ { "type": "text", "text": "Primeiro" } ] },
            { "type": "paragraph", "content": [ { "type": "text", "text": "Segundo" } ] }
          ]
        }
        """;

        var result = ContentTextExtractor.ExtractPlainText(json);

        Assert.Contains("Primeiro", result);
        Assert.Contains("Segundo", result);
    }
}
