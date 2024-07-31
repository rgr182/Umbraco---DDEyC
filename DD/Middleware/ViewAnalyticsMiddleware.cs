using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using DDEyC.Services;
using Microsoft.Extensions.Logging;

namespace DDEyC.Middleware
{
    public class ViewAnalyticsMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ViewAnalyticsMiddleware> _logger;

        public ViewAnalyticsMiddleware(RequestDelegate next, ILogger<ViewAnalyticsMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, ViewAnalyticsService analyticsService)
        {
            if (ShouldProcessRequest(context.Request))
            {
                try
                {
                    await analyticsService.TrackPageViewAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while tracking page view");
                }
            }

            await _next(context);
        }

        private bool ShouldProcessRequest(HttpRequest request)
        {
            return !request.Path.StartsWithSegments("/umbraco") &&
                   !request.Path.StartsWithSegments("/api") &&
                   !IsAssetRequest(request);
        }

        private bool IsAssetRequest(HttpRequest request)
        {
            string path = request.Path.Value.ToLowerInvariant();
            
            string[] assetExtensions = { ".css", ".js", ".map", ".jpg", ".jpeg", ".png", ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".eot" };
            
            return Array.Exists(assetExtensions, ext => path.EndsWith(ext)) ||
                   path.StartsWith("/media/") ||
                   path.StartsWith("/scripts/") ||
                   path.StartsWith("/api/") ||
                   path.StartsWith("/css/");
        }
    }
}