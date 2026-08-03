using Caffeine.Domain;
using Microsoft.AspNetCore.Mvc;

namespace Caffeine.Api.Controllers;

[ApiController]
[Route("api/nodes")]
public class NodesController(INodeRepository repository) : ControllerBase
{
    [HttpGet("tree")]
    public async Task<ActionResult<List<NodeDto>>> GetTree(CancellationToken cancellationToken)
    {
        var nodes = await repository.GetTreeAsync(cancellationToken);
        return Ok(nodes.Select(ToDto).ToList());
    }

    [HttpPost]
    public async Task<ActionResult<NodeDto>> Create(CreateNodeRequest request, CancellationToken cancellationToken)
    {
        NodeType? parentType = null;

        if (request.ParentId is not null)
        {
            var parent = await repository.GetByIdAsync(request.ParentId.Value, cancellationToken);
            if (parent is null)
            {
                return BadRequest("Pasta/documento pai não encontrado.");
            }

            parentType = parent.NodeType;
        }

        if (!NodeTreeValidator.IsParentTypeAllowed(request.NodeType, parentType))
        {
            return BadRequest($"Um nó do tipo {request.NodeType} não pode ser criado sob um nó do tipo {parentType}.");
        }

        var node = new Node
        {
            Id = Guid.NewGuid(),
            ParentId = request.ParentId,
            NodeType = request.NodeType,
            Title = request.Title,
            SortOrder = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        await repository.AddAsync(node, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetTree), ToDto(node));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<NodeDto>> Update(Guid id, UpdateNodeRequest request, CancellationToken cancellationToken)
    {
        var node = await repository.GetByIdAsync(id, cancellationToken);
        if (node is null)
        {
            return NotFound();
        }

        if (request.ParentId != node.ParentId)
        {
            var allNodes = await repository.GetTreeAsync(cancellationToken);

            if (!NodeTreeValidator.CanMove(id, request.ParentId, allNodes))
            {
                return BadRequest("Não é possível mover um nó para dentro dele mesmo ou de seus descendentes.");
            }

            NodeType? newParentType = null;
            if (request.ParentId is not null)
            {
                var newParent = allNodes.FirstOrDefault(n => n.Id == request.ParentId.Value);
                if (newParent is null)
                {
                    return BadRequest("Pasta/documento pai não encontrado.");
                }

                newParentType = newParent.NodeType;
            }

            if (!NodeTreeValidator.IsParentTypeAllowed(node.NodeType, newParentType))
            {
                return BadRequest($"Um nó do tipo {node.NodeType} não pode ser movido para um nó do tipo {newParentType}.");
            }

            node.ParentId = request.ParentId;
        }

        node.Title = request.Title;
        node.SortOrder = request.SortOrder;
        node.UpdatedAt = DateTime.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);

        return Ok(ToDto(node));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var node = await repository.GetByIdAsync(id, cancellationToken);
        if (node is null)
        {
            return NotFound();
        }

        var allNodes = await repository.GetTreeAsync(cancellationToken);
        var descendantIds = GetDescendantIds(id, allNodes);

        foreach (var descendantId in descendantIds)
        {
            var descendant = await repository.GetByIdAsync(descendantId, cancellationToken);
            if (descendant is null)
            {
                continue;
            }

            descendant.IsDeleted = true;
            descendant.UpdatedAt = DateTime.UtcNow;
        }

        node.IsDeleted = true;
        node.UpdatedAt = DateTime.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private static IEnumerable<Guid> GetDescendantIds(Guid rootId, List<Node> allNodes)
    {
        var childrenByParent = allNodes
            .Where(n => n.ParentId is not null)
            .GroupBy(n => n.ParentId!.Value)
            .ToDictionary(g => g.Key, g => g.ToList());

        var queue = new Queue<Guid>();
        queue.Enqueue(rootId);

        while (queue.Count > 0)
        {
            var currentId = queue.Dequeue();
            if (!childrenByParent.TryGetValue(currentId, out var children))
            {
                continue;
            }

            foreach (var child in children)
            {
                yield return child.Id;
                queue.Enqueue(child.Id);
            }
        }
    }

    private static NodeDto ToDto(Node node) =>
        new(node.Id, node.ParentId, node.NodeType, node.Title, node.SortOrder);
}
