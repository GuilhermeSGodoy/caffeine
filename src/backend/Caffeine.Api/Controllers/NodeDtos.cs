using Caffeine.Domain;

namespace Caffeine.Api.Controllers;

public record NodeDto(Guid Id, Guid? ParentId, NodeType NodeType, string Title, int SortOrder);

public record CreateNodeRequest(Guid? ParentId, NodeType NodeType, string Title);

public record UpdateNodeRequest(string Title, int SortOrder, Guid? ParentId);
