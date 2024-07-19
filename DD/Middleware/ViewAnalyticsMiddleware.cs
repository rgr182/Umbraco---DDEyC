using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using DDEyC.Services;

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
            // Only track page views for non-Umbraco requests
            if (!context.Request.Path.StartsWithSegments("/umbraco"))
            {
                analyticsService.TrackPageView();
            }

            await _next(context);
        }
    }
}