namespace Caffeine.Domain;

public class Node
{
    public Guid Id { get; set; }
    public Guid? ParentId { get; set; }
    public NodeType NodeType { get; set; }
    public string Title { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
}
