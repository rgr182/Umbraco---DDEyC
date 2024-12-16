using Microsoft.EntityFrameworkCore;
using DDEyC.Data;
WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

IConfiguration configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile("appsettings.QA.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")}.json", optional: true)
    .Build();

builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddComposers()
    .Build();

builder.Services.AddMemoryCache();
builder.Services.AddDbContext<AnalyticsContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("umbracoDbDSN")));


builder.Services.AddScoped<DDEyC.Repositories.ViewAnalyticsRepository>();
builder.Services.AddScoped<DDEyC.Services.ViewAnalyticsService>();
builder.Services.AddScoped<DDEyC.Services.IAnalyticsAggregationService,DDEyC.Services.AnalyticsAggregationService>();
builder.Services.AddHttpContextAccessor();

// Add session services
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Set your desired session timeout
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

WebApplication app = builder.Build();
app.UseStaticFiles();

// Use session middleware
app.UseSession();

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = (int)System.Net.HttpStatusCode.InternalServerError;
        context.Response.ContentType = "application/json";

        var exceptionHandlerPathFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
        var exception = exceptionHandlerPathFeature?.Error;

        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogError(exception, "An unhandled exception occurred.");

        await context.Response.WriteAsJsonAsync(new { error = "An unexpected error occurred. Please try again later." });
    });
});

// Use the ViewAnalyticsMiddleware
app.UseMiddleware<DDEyC.Middleware.ViewAnalyticsMiddleware>();

try
{
    app.Logger.LogInformation("Starting Umbraco application");
    await app.BootUmbracoAsync();
    app.Logger.LogInformation("Umbraco application started successfully");

    app.UseUmbraco()
        .WithMiddleware(u =>
        {
            u.UseBackOffice();
            u.UseWebsite();
        })
        .WithEndpoints(u =>
        {
            u.UseInstallerEndpoints();
            u.UseBackOfficeEndpoints();
            u.UseWebsiteEndpoints();
        });

    await app.RunAsync();
}
catch (Exception ex)
{
    app.Logger.LogError(ex, "An error occurred while starting the Umbraco application");
    throw;
}