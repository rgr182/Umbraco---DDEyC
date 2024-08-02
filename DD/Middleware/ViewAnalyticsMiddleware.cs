using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using DDEyC.Services;
using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;

namespace DDEyC.Middleware
{
    public class ViewAnalyticsMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ViewAnalyticsMiddleware> _logger;
        private static readonly Regex AssetExtensionRegex = new Regex(@"\.(css|js)(\.[a-zA-Z0-9]+)?$", RegexOptions.Compiled | RegexOptions.IgnoreCase);

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
            string path = request.Path.Value.ToLowerInvariant();
            
            return !path.StartsWith("/umbraco") &&
                   !path.StartsWith("/api") &&
                   !path.StartsWith("/sb/") &&
                   !path.Contains("umbraco-backoffice") &&
                   !IsAssetRequest(path);
        }

        private bool IsAssetRequest(string path)
        {
            string[] assetExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".eot", ".map" };
            
            return assetExtensions.Any(ext => path.EndsWith(ext, StringComparison.OrdinalIgnoreCase)) ||
                   AssetExtensionRegex.IsMatch(path) ||
                   path.StartsWith("/media/") ||
                   path.StartsWith("/scripts/") ||
                   path.StartsWith("/css/");
        }
    }
}