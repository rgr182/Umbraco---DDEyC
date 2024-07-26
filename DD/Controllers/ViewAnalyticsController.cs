using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using DDEyC.Services;

namespace DDEyC.Controllers
{
    public class ViewAnalyticsController : UmbracoApiController
    {
        private readonly ViewAnalyticsService _analyticsService;

        public ViewAnalyticsController(ViewAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPageViews()
        {
            var pageViews = await _analyticsService.GetAllPageViewsAsync();
            return Ok(pageViews);
        }

        [HttpGet]
        public async Task<IActionResult> GetPageViewsByDateRange(DateTime start, DateTime end)
        {
            var pageViews = await _analyticsService.GetPageViewsByDateRangeAsync(start, end);
            return Ok(pageViews);
        }
    }
}