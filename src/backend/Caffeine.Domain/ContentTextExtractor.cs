using System.Text;
using System.Text.Json;

namespace Caffeine.Domain;

public static class ContentTextExtractor
{
    public static string ExtractPlainText(string contentJson)
    {
        using var document = JsonDocument.Parse(contentJson);
        var builder = new StringBuilder();
        Walk(document.RootElement, builder);
        return builder.ToString().Trim();
    }

    private static void Walk(JsonElement element, StringBuilder builder)
    {
        if (element.ValueKind != JsonValueKind.Object)
        {
            return;
        }

        if (element.TryGetProperty("text", out var textProperty) && textProperty.ValueKind == JsonValueKind.String)
        {
            builder.Append(textProperty.GetString());
            builder.Append(' ');
        }

        if (element.TryGetProperty("content", out var contentProperty) && contentProperty.ValueKind == JsonValueKind.Array)
        {
            foreach (var child in contentProperty.EnumerateArray())
            {
                Walk(child, builder);
            }

            builder.Append('\n');
        }
    }
}
