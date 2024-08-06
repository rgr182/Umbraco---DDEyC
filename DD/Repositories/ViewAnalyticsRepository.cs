using DDEyC.Models;
using DDEyC.Data;
using Microsoft.EntityFrameworkCore;

namespace DDEyC.Repositories
{
    public class ViewAnalyticsRepository
    {
        private readonly AnalyticsContext _context;
        private readonly ILogger<ViewAnalyticsRepository> _logger;

        public ViewAnalyticsRepository(AnalyticsContext context, ILogger<ViewAnalyticsRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task AddAsync(AnalyticsView siteView)
        {
            if (siteView == null)
            {
                throw new ArgumentNullException(nameof(siteView));
            }

            try
            {
                await _context.SiteViews.AddAsync(siteView);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while adding site view: {@SiteView}", siteView);
                throw;
            }
        }

        public async Task<IEnumerable<AnalyticsView>> GetAllAsync()
        {
            try
            {
                return await _context.SiteViews.ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching all site views");
                throw;
            }
        }

        public async Task<IEnumerable<AnalyticsView>> GetByDateRangeAsync(DateTime start, DateTime end)
        {
            if (start >= end)
            {
                throw new ArgumentException("Start date must be before end date.");
            }

            try
            {
                return await _context.SiteViews
                    .Where(v => v.Timestamp >= start && v.Timestamp <= end)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching site views for date range: {Start} to {End}", start, end);
                throw;
            }
        }

        public async Task<IEnumerable<AnalyticsView>> GetPagedAsync(int page, int pageSize)
        {
            if (page < 1)
            {
                throw new ArgumentException("Page must be greater than 0.", nameof(page));
            }

            if (pageSize < 1)
            {
                throw new ArgumentException("Page size must be greater than 0.", nameof(pageSize));
            }

            try
            {
                return await _context.SiteViews
                    .OrderByDescending(v => v.Timestamp)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching paged site views. Page: {Page}, PageSize: {PageSize}", page, pageSize);
                throw;
            }
        }
    }
}