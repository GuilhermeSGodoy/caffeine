using Caffeine.Domain;
using Microsoft.AspNetCore.Mvc;

namespace Caffeine.Api.Controllers;

[ApiController]
[Route("api/documents")]
public class DocumentContentController(IDocumentContentRepository repository, INodeRepository nodeRepository) : ControllerBase
{
    [HttpGet("{nodeId:guid}")]
    public async Task<ActionResult<DocumentContentDto>> Get(Guid nodeId, CancellationToken cancellationToken)
    {
        var content = await repository.GetByNodeIdAsync(nodeId, cancellationToken);

        if (content is null)
        {
            return Ok(new DocumentContentDto(nodeId, "{\"type\":\"doc\",\"content\":[]}", 0, 0));
        }

        return Ok(ToDto(content));
    }

    [HttpPut("{nodeId:guid}")]
    public async Task<ActionResult<DocumentContentDto>> Save(Guid nodeId, SaveDocumentContentRequest request, CancellationToken cancellationToken)
    {
        var node = await nodeRepository.GetByIdAsync(nodeId, cancellationToken);
        if (node is null)
        {
            return NotFound();
        }

        if (node.NodeType is not (NodeType.Document or NodeType.Chapter))
        {
            return BadRequest("Somente documentos ou capítulos podem ter conteúdo.");
        }

        var plainText = ContentTextExtractor.ExtractPlainText(request.ContentJson);
        var (wordCount, charCount) = WordCountCalculator.Count(plainText);

        var content = await repository.GetByNodeIdAsync(nodeId, cancellationToken);
        if (content is null)
        {
            content = new DocumentContent { NodeId = nodeId };
            await repository.AddAsync(content, cancellationToken);
        }

        content.ContentJson = request.ContentJson;
        content.PlainTextCache = plainText;
        content.WordCount = wordCount;
        content.CharCount = charCount;
        content.UpdatedAt = DateTime.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);

        return Ok(ToDto(content));
    }

    private static DocumentContentDto ToDto(DocumentContent content) =>
        new(content.NodeId, content.ContentJson, content.WordCount, content.CharCount);
}
