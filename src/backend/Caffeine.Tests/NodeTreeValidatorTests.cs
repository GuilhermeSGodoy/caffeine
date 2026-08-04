using Caffeine.Domain;

namespace Caffeine.Tests;

public class NodeTreeValidatorTests
{
    [Theory]
    [InlineData(NodeType.Folder, null, true)]
    [InlineData(NodeType.Folder, NodeType.Folder, true)]
    [InlineData(NodeType.Project, null, true)]
    [InlineData(NodeType.Project, NodeType.Folder, true)]
    [InlineData(NodeType.Document, null, false)]
    [InlineData(NodeType.Document, NodeType.Folder, true)]
    [InlineData(NodeType.Document, NodeType.Project, true)]
    [InlineData(NodeType.Document, NodeType.Document, false)]
    [InlineData(NodeType.Chapter, NodeType.Document, true)]
    [InlineData(NodeType.Chapter, NodeType.Chapter, true)]
    [InlineData(NodeType.Chapter, NodeType.Folder, false)]
    public void IsParentTypeAllowed_ReturnsExpectedResult(NodeType childType, NodeType? parentType, bool expected)
    {
        var result = NodeTreeValidator.IsParentTypeAllowed(childType, parentType);

        Assert.Equal(expected, result);
    }

    [Fact]
    public void IsDuplicateSiblingName_SameParentSameTitle_ReturnsTrue()
    {
        var parentId = Guid.NewGuid();
        var allNodes = new List<Node>
        {
            new() { Id = Guid.NewGuid(), ParentId = parentId, NodeType = NodeType.Document, Title = "Capítulo 1" }
        };

        var result = NodeTreeValidator.IsDuplicateSiblingName(null, parentId, "Capítulo 1", allNodes);

        Assert.True(result);
    }

    [Fact]
    public void IsDuplicateSiblingName_ComparisonIsCaseAndWhitespaceInsensitive()
    {
        var parentId = Guid.NewGuid();
        var allNodes = new List<Node>
        {
            new() { Id = Guid.NewGuid(), ParentId = parentId, NodeType = NodeType.Document, Title = "Capítulo 1" }
        };

        var result = NodeTreeValidator.IsDuplicateSiblingName(null, parentId, "  CAPÍTULO 1  ", allNodes);

        Assert.True(result);
    }

    [Fact]
    public void IsDuplicateSiblingName_DifferentParent_ReturnsFalse()
    {
        var allNodes = new List<Node>
        {
            new() { Id = Guid.NewGuid(), ParentId = Guid.NewGuid(), NodeType = NodeType.Document, Title = "Capítulo 1" }
        };

        var result = NodeTreeValidator.IsDuplicateSiblingName(null, Guid.NewGuid(), "Capítulo 1", allNodes);

        Assert.False(result);
    }

    [Fact]
    public void IsDuplicateSiblingName_ExcludesTheNodeBeingRenamed()
    {
        var parentId = Guid.NewGuid();
        var nodeId = Guid.NewGuid();
        var allNodes = new List<Node>
        {
            new() { Id = nodeId, ParentId = parentId, NodeType = NodeType.Document, Title = "Capítulo 1" }
        };

        var result = NodeTreeValidator.IsDuplicateSiblingName(nodeId, parentId, "Capítulo 1", allNodes);

        Assert.False(result);
    }

    [Fact]
    public void CanMove_ToRoot_IsAlwaysAllowed()
    {
        var nodeId = Guid.NewGuid();

        var result = NodeTreeValidator.CanMove(nodeId, null, []);

        Assert.True(result);
    }

    [Fact]
    public void CanMove_IntoItself_IsNotAllowed()
    {
        var nodeId = Guid.NewGuid();

        var result = NodeTreeValidator.CanMove(nodeId, nodeId, []);

        Assert.False(result);
    }

    [Fact]
    public void CanMove_IntoOwnDescendant_IsNotAllowed()
    {
        var folderId = Guid.NewGuid();
        var childId = Guid.NewGuid();
        var grandchildId = Guid.NewGuid();

        var allNodes = new List<Node>
        {
            new() { Id = folderId, ParentId = null, NodeType = NodeType.Folder, Title = "Raiz" },
            new() { Id = childId, ParentId = folderId, NodeType = NodeType.Folder, Title = "Filho" },
            new() { Id = grandchildId, ParentId = childId, NodeType = NodeType.Folder, Title = "Neto" }
        };

        var result = NodeTreeValidator.CanMove(folderId, grandchildId, allNodes);

        Assert.False(result);
    }

    [Fact]
    public void CanMove_ToUnrelatedNode_IsAllowed()
    {
        var folderAId = Guid.NewGuid();
        var folderBId = Guid.NewGuid();

        var allNodes = new List<Node>
        {
            new() { Id = folderAId, ParentId = null, NodeType = NodeType.Folder, Title = "A" },
            new() { Id = folderBId, ParentId = null, NodeType = NodeType.Folder, Title = "B" }
        };

        var result = NodeTreeValidator.CanMove(folderAId, folderBId, allNodes);

        Assert.True(result);
    }
}
