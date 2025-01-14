using DDEyC.Models;
using DDEyC.Repositories;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;


namespace DDEyC.Services
{
    public class ViewAnalyticsService
    {
        private readonly ViewAnalyticsRepository _repository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMemoryCache _cache;
        private readonly ILogger<ViewAnalyticsService> _logger;
        private const string ViewedPagesSessionKey = "ViewedPages";
        private const string AllPageViewsCacheKey = "AllPageViews";
        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(15);

        public ViewAnalyticsService(
            ViewAnalyticsRepository repository, 
            IHttpContextAccessor httpContextAccessor,
            IMemoryCache cache,
            ILogger<ViewAnalyticsService> logger)
        {
            _repository = repository;
            _httpContextAccessor = httpContextAccessor;
            _cache = cache;
            _logger = logger;
        }

        public async Task TrackPageViewAsync()
        {
            var context = _httpContextAccessor.HttpContext;
            var session = context.Session;
            var currentUrl = context.Request.Path;
            var currentTimestamp = DateTime.UtcNow;

            var viewedPages = GetViewedPagesFromSession(session);

            if (!viewedPages.ContainsKey(currentUrl) || 
                (currentTimestamp - viewedPages[currentUrl]).TotalMinutes >= 30)
            {
                var siteView = new AnalyticsView
                {
                    Url = currentUrl,
                    Timestamp = currentTimestamp,
                    UserAgent = context.Request.Headers["User-Agent"],
                    IpAddress = GetIpAddress(context)
                };

                try
                {
                    await _repository.AddAsync(siteView);
                    _cache.Remove(AllPageViewsCacheKey);  // Invalidate cache

                    // Update the viewed pages in the session
                    viewedPages[currentUrl] = currentTimestamp;
                    SaveViewedPagesToSession(session, viewedPages);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while tracking page view for URL: {Url}", currentUrl);
                    throw;
                }
            }
        }

        private Dictionary<string, DateTime> GetViewedPagesFromSession(ISession session)
        {
            var viewedPagesJson = session.GetString(ViewedPagesSessionKey);
            if (string.IsNullOrEmpty(viewedPagesJson))
            {
                return new Dictionary<string, DateTime>();
            }
            return JsonSerializer.Deserialize<Dictionary<string, DateTime>>(viewedPagesJson);
        }

        private void SaveViewedPagesToSession(ISession session, Dictionary<string, DateTime> viewedPages)
        {
            var viewedPagesJson = JsonSerializer.Serialize(viewedPages);
            session.SetString(ViewedPagesSessionKey, viewedPagesJson);
        }

        private string GetIpAddress(HttpContext context)
        {
            var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                return forwardedFor.Split(',')[0].Trim();
            }
            return context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        }

        public async Task<IEnumerable<AnalyticsView>> GetAllPageViewsAsync()
        {
            if (_cache.TryGetValue(AllPageViewsCacheKey, out IEnumerable<AnalyticsView> cachedViews))
            {
                return cachedViews;
            }

            var pageViews = await _repository.GetAllAsync();
            _cache.Set(AllPageViewsCacheKey, pageViews, CacheDuration);
            return pageViews;
        }

        public Task<IEnumerable<AnalyticsView>> GetPageViewsByDateRangeAsync(DateTime start, DateTime end)
        {
            return _repository.GetByDateRangeAsync(start, end);
        }
    }
}