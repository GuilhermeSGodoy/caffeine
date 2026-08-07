using System.Text.Json;
using Caffeine.Domain;

namespace Caffeine.Tests;

public class DocumentContentTests
{
    [Fact]
    public void ContentJson_Default_IsNotAnEmptyDocument()
    {
        var content = new DocumentContent();

        using var document = JsonDocument.Parse(content.ContentJson);
        var root = document.RootElement;

        Assert.Equal("doc", root.GetProperty("type").GetString());

        var children = root.GetProperty("content").EnumerateArray().ToList();
        Assert.Single(children);
        Assert.Equal("paragraph", children[0].GetProperty("type").GetString());
    }

    [Fact]
    public void ContentJson_Default_HasNoText()
    {
        var plainText = ContentTextExtractor.ExtractPlainText(DocumentContent.DefaultContentJson);

        Assert.Equal(string.Empty, plainText);
    }
}
