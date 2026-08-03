namespace Caffeine.Domain;

public class DocumentContent
{
    public Guid NodeId { get; set; }
    public string ContentJson { get; set; } = "{\"type\":\"doc\",\"content\":[]}";
    public string PlainTextCache { get; set; } = string.Empty;
    public int WordCount { get; set; }
    public int CharCount { get; set; }
    public DateTime UpdatedAt { get; set; }
}
