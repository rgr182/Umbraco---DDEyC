using System;
using System.Collections.Generic;
using System.Linq;
using NPoco;
using Umbraco.Cms.Infrastructure.Scoping;
using DDEyC.Models;

namespace DDEyC.Repositories
{
    public class ViewAnalyticsRepository
    {
        private readonly IScopeProvider _scopeProvider;

        public ViewAnalyticsRepository(IScopeProvider scopeProvider)
        {
            _scopeProvider = scopeProvider;
        }

        public void Add(AnalyticsView siteView)
        {
            using (var scope = _scopeProvider.CreateScope())
            {
                scope.Database.Insert(siteView);
                scope.Complete();
            }
        }

        public IEnumerable<AnalyticsView> GetAll()
        {
            using (var scope = _scopeProvider.CreateScope())
            {
                return scope.Database.Fetch<AnalyticsView>();
            }
        }

        public IEnumerable<AnalyticsView> GetByDateRange(DateTime start, DateTime end)
        {
            using (var scope = _scopeProvider.CreateScope())
            {
                return scope.Database.Fetch<AnalyticsView>("WHERE Timestamp BETWEEN @0 AND @1", start, end);
            }
        }
    }
}