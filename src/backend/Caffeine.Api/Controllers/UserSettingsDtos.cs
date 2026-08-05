namespace Caffeine.Api.Controllers;

public record UserSettingsDto(string Theme);

public record SaveUserSettingsRequest(string Theme);
