namespace Caffeine.Api.Controllers;

public record DocumentContentDto(Guid NodeId, string ContentJson, int WordCount, int CharCount);

public record SaveDocumentContentRequest(string ContentJson);
