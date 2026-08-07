namespace Caffeine.Domain;

public class DocumentContent
{
    public const string DefaultContentJson = "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[]}]}";

    public Guid NodeId { get; set; }
    public string ContentJson { get; set; } = DefaultContentJson;
    public string PlainTextCache { get; set; } = string.Empty;
    public int WordCount { get; set; }
    public int CharCount { get; set; }
    public DateTime UpdatedAt { get; set; }
}
