using DDEyC.Models;
using DDEyC.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DDEyC.Repositories
{
    public class ViewAnalyticsRepository
    {
        private readonly AnalyticsContext _context;

        public ViewAnalyticsRepository(AnalyticsContext context)
        {
            _context = context;
        }

        public async Task AddAsync(AnalyticsView siteView)
        {
            await _context.SiteViews.AddAsync(siteView);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<AnalyticsView>> GetAllAsync()
        {
            return await _context.SiteViews.ToListAsync();
        }

        public async Task<IEnumerable<AnalyticsView>> GetByDateRangeAsync(DateTime start, DateTime end)
        {
            return await _context.SiteViews
                .Where(v => v.Timestamp >= start && v.Timestamp <= end)
                .ToListAsync();
        }
    }
}