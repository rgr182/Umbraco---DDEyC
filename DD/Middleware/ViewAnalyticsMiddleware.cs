using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using DDEyC.Services;
using System;

namespace DDEyC.Middleware
{
    public class ViewAnalyticsMiddleware
    {
        private readonly RequestDelegate _next;

        public ViewAnalyticsMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ViewAnalyticsService analyticsService)
        {
        // Only track page views for non-Umbraco requests and non-asset requests
        if (!context.Request.Path.StartsWithSegments("/umbraco") && !IsAssetRequest(context.Request))
        {
           await analyticsService.TrackPageViewAsync();
        }

        await _next(context);
        }

        private bool IsAssetRequest(HttpRequest request)
        {
            string path = request.Path.Value.ToLowerInvariant();
            
            // Check for common asset extensions
            string[] assetExtensions = { ".css", ".js", ".jpg", ".jpeg", ".png", ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".eot" };
            
            return Array.Exists(assetExtensions, ext => path.EndsWith(ext)) ||
                   path.StartsWith("/media/") ||
                   path.StartsWith("/scripts/") ||
                   path.StartsWith("/css/");
        }
    }
}