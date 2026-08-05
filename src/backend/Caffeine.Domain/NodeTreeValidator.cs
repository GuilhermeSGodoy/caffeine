namespace Caffeine.Domain;

public static class NodeTreeValidator
{
    private static readonly Dictionary<NodeType, NodeType[]> AllowedParentTypes = new()
    {
        [NodeType.Folder] = [NodeType.Folder],
        [NodeType.Project] = [NodeType.Folder],
        [NodeType.Document] = [NodeType.Folder, NodeType.Project],
        [NodeType.Chapter] = [NodeType.Document]
    };

    public static bool IsParentTypeAllowed(NodeType childType, NodeType? parentType)
    {
        if (parentType is null)
        {
            return childType is NodeType.Folder or NodeType.Project;
        }

        return AllowedParentTypes[childType].Contains(parentType.Value);
    }

    public static bool IsDuplicateSiblingName(Guid? excludeNodeId, Guid? parentId, string title, IReadOnlyCollection<Node> allNodes) =>
        allNodes.Any(n =>
            n.Id != excludeNodeId &&
            n.ParentId == parentId &&
            string.Equals(n.Title.Trim(), title.Trim(), StringComparison.OrdinalIgnoreCase));

    public static bool CanMove(Guid nodeId, Guid? newParentId, IReadOnlyCollection<Node> allNodes)
    {
        if (newParentId is null)
        {
            return true;
        }

        if (newParentId == nodeId)
        {
            return false;
        }

        var nodesById = allNodes.ToDictionary(n => n.Id);
        var currentId = newParentId;

        while (currentId is not null)
        {
            if (currentId == nodeId)
            {
                return false;
            }

            if (!nodesById.TryGetValue(currentId.Value, out var current))
            {
                break;
            }

            currentId = current.ParentId;
        }

        return true;
    }
}
