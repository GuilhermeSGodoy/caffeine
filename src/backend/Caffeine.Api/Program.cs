using Caffeine.Domain;
using Caffeine.Infrastructure;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var explicitUrl = Environment.GetEnvironmentVariable("CAFFEINE_API_URL");
if (!string.IsNullOrWhiteSpace(explicitUrl))
{
    builder.WebHost.UseUrls(explicitUrl);
}
else
{
    // Porta 0 = o SO escolhe uma porta livre; a porta real é impressa no stdout
    // para o processo Electron capturar quando spawna o backend em produção.
    builder.WebHost.UseUrls("http://127.0.0.1:0");
}

builder.Services.AddSingleton<IAppDataPathProvider, AppDataPathProvider>();
builder.Services.AddScoped<INodeRepository, NodeRepository>();
builder.Services.AddScoped<IDocumentContentRepository, DocumentContentRepository>();

builder.Services.AddDbContext<CaffeineDbContext>((serviceProvider, options) =>
{
    var pathProvider = serviceProvider.GetRequiredService<IAppDataPathProvider>();
    options.UseSqlite($"Data Source={pathProvider.GetDatabasePath()}");
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<CaffeineDbContext>();
    dbContext.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Start();

var addressesFeature = app.Services.GetRequiredService<Microsoft.AspNetCore.Hosting.Server.IServer>()
    .Features.Get<Microsoft.AspNetCore.Hosting.Server.Features.IServerAddressesFeature>();

foreach (var address in addressesFeature?.Addresses ?? [])
{
    var port = new Uri(address).Port;
    Console.WriteLine($"PORT={port}");
}

await app.WaitForShutdownAsync();
