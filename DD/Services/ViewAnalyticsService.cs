using DDEyC.Models;
using DDEyC.Repositories;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace DDEyC.Services
{
    public class ViewAnalyticsService
    {
        private readonly ViewAnalyticsRepository _repository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private const string ViewedPagesSessionKey = "ViewedPages";

        public ViewAnalyticsService(ViewAnalyticsRepository repository, IHttpContextAccessor httpContextAccessor)
        {
            _repository = repository;
            _httpContextAccessor = httpContextAccessor;
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
                    IpAddress = context.Connection.RemoteIpAddress.ToString()
                };

                await _repository.AddAsync(siteView);

                // Update the viewed pages in the session
                viewedPages[currentUrl] = currentTimestamp;
                SaveViewedPagesToSession(session, viewedPages);
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

        public Task<IEnumerable<AnalyticsView>> GetAllPageViewsAsync()
        {
            return _repository.GetAllAsync();
        }

        public Task<IEnumerable<AnalyticsView>> GetPageViewsByDateRangeAsync(DateTime start, DateTime end)
        {
            return _repository.GetByDateRangeAsync(start, end);
        }
    }
}