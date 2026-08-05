using Caffeine.Domain;
using Microsoft.AspNetCore.Mvc;

namespace Caffeine.Api.Controllers;

[ApiController]
[Route("api/user-settings")]
public class UserSettingsController(IUserSettingsRepository repository) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<UserSettingsDto>> Get(CancellationToken cancellationToken)
    {
        var settings = await repository.GetAsync(cancellationToken);

        return Ok(new UserSettingsDto(settings?.Theme ?? ThemeCatalog.DefaultThemeId));
    }

    [HttpPut]
    public async Task<ActionResult<UserSettingsDto>> Save(SaveUserSettingsRequest request, CancellationToken cancellationToken)
    {
        if (!ThemeCatalog.IsValid(request.Theme))
        {
            return BadRequest("Tema inválido.");
        }

        var settings = await repository.GetAsync(cancellationToken);
        if (settings is null)
        {
            settings = new UserSettings();
            await repository.AddAsync(settings, cancellationToken);
        }

        settings.Theme = request.Theme;

        await repository.SaveChangesAsync(cancellationToken);

        return Ok(new UserSettingsDto(settings.Theme));
    }
}
