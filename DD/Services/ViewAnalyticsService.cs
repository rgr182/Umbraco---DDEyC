using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using DDEyC.Models;
using DDEyC.Repositories;

namespace DDEyC.Services
{
    public class ViewAnalyticsService
    {
        private readonly ViewAnalyticsRepository _repository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ViewAnalyticsService(ViewAnalyticsRepository repository, IHttpContextAccessor httpContextAccessor)
        {
            _repository = repository;
            _httpContextAccessor = httpContextAccessor;
        }

        public void TrackPageView()
        {
            var context = _httpContextAccessor.HttpContext;
            var siteView = new AnalyticsView
            {
                Url = context.Request.Path,
                Timestamp = DateTime.UtcNow,
                UserAgent = context.Request.Headers["User-Agent"],
                IpAddress = context.Connection.RemoteIpAddress.ToString()
            };

            _repository.Add(siteView);
        }

        public IEnumerable<AnalyticsView> GetAllPageViews()
        {
            return _repository.GetAll();
        }

        public IEnumerable<AnalyticsView> GetPageViewsByDateRange(DateTime start, DateTime end)
        {
            return _repository.GetByDateRange(start, end);
        }
    }
}