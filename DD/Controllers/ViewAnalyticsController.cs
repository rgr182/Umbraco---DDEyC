using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.BackOffice.Controllers;
using DDEyC.Services;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using DDEyC.Models;

namespace DDEyC.Controllers
{
    public class ViewAnalyticsController : UmbracoAuthorizedApiController
    {
        private readonly ViewAnalyticsService _analyticsService;
        private readonly ILogger<ViewAnalyticsController> _logger;
        private readonly IAnalyticsAggregationService _aggregationService;

        public ViewAnalyticsController(ViewAnalyticsService analyticsService, ILogger<ViewAnalyticsController> logger, IAnalyticsAggregationService aggregationService)
        {
            _analyticsService = analyticsService;
            _aggregationService = aggregationService;
            _logger = logger;
        }

        [HttpGet]
        [Route("umbraco/backoffice/api/ViewAnalytics/GetAllPageViews")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllPageViews()
        {
            try
            {
                var pageViews = await _analyticsService.GetAllPageViewsAsync();
                return Content(JsonConvert.SerializeObject(pageViews, new JsonSerializerSettings
                {
                    ContractResolver = new CamelCasePropertyNamesContractResolver()
                }), "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching all page views");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpGet]
        [Route("umbraco/backoffice/api/ViewAnalytics/GetPageViewsByDateRange")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetPageViewsByDateRange([FromQuery] DateTime start, [FromQuery] DateTime end)
        {
            if (start >= end)
            {
                return BadRequest("Start date must be before end date.");
            }

            try
            {
                var pageViews = await _analyticsService.GetPageViewsByDateRangeAsync(start, end);
                return Content(JsonConvert.SerializeObject(pageViews, new JsonSerializerSettings
                {
                    ContractResolver = new CamelCasePropertyNamesContractResolver()
                }), "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching page views for date range: {Start} to {End}", start, end);
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }
        [HttpGet]
        [Route("umbraco/backoffice/AnalyticsDashboard/Dashboard")]
        public async Task<IActionResult> Dashboard(DateTime? start, DateTime? end)
        {
            _logger.LogInformation("Dashboard accessed");
            try
            {
                var startDate = start ?? DateTime.UtcNow.AddDays(-30);
                var endDate = end ?? DateTime.UtcNow;

                var pageViews = await _analyticsService.GetPageViewsByDateRangeAsync(startDate, endDate);

                var viewModel = new AnalyticsDashboardViewModel
                {
                    StartDate = startDate,
                    EndDate = endDate,
                    DailyStats = pageViews
                        .GroupBy(v => v.Timestamp.Date)
                        .Select(g => new DailyAnalytics
                        {
                            Date = g.Key,
                            PageViews = g.GroupBy(v => v.Url)
                                        .ToDictionary(pg => pg.Key, pg => pg.Count()),
                            DailyTotal = g.Count()
                        })
                        .OrderBy(d => d.Date)
                        .ToList(),

                    PageTotals = pageViews
                        .GroupBy(v => v.Url)
                        .ToDictionary(g => g.Key, g => g.Count()),

                    GrandTotal = pageViews.Count(),

                    UniqueUrls = pageViews
                        .Select(v => v.Url)
                        .Distinct()
                        .OrderBy(u => u)
                        .ToList()
                };

                // Add headers to prevent caching and signal frame completion
                Response.Headers.Add("X-Frame-Options", "SAMEORIGIN");
                Response.Headers.Add("X-Content-Type-Options", "nosniff");
                Response.Headers.Add("Cache-Control", "no-store, no-cache, must-revalidate");
                Response.Headers.Add("X-Frame-Complete", "true");  // Custom header for frame completion

                return new ViewResult
                {
                    ViewName = "~/App_Plugins/AnalyticsDashboard/AnalyticsDashboard.cshtml",
                    ViewData = new Microsoft.AspNetCore.Mvc.ViewFeatures.ViewDataDictionary<AnalyticsDashboardViewModel>(
                        new Microsoft.AspNetCore.Mvc.ModelBinding.EmptyModelMetadataProvider(),
                        new Microsoft.AspNetCore.Mvc.ModelBinding.ModelStateDictionary())
                    {
                        Model = viewModel
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while loading analytics dashboard");
                return Problem("An error occurred while loading the dashboard");
            }
        }
        [HttpGet]
        [Route("/umbraco/backoffice/AnalyticsDashboard/GetChartData")]
        public async Task<IActionResult> GetChartData(DateTime start, DateTime end, string selectedUrl = null)
        {
            var pageViews = await _analyticsService.GetPageViewsByDateRangeAsync(start, end);

            var chartData = pageViews
                .Where(v => selectedUrl == null || v.Url == selectedUrl)
                .GroupBy(v => v.Timestamp.Date)
                .Select(g => new
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Views = selectedUrl == null
                        ? g.GroupBy(v => v.Url)
                            .ToDictionary(pg => pg.Key, pg => pg.Count())
                        : new Dictionary<string, int> { { selectedUrl, g.Count() } }
                })
                .OrderBy(d => d.Date)
                .ToList();

            return Ok(chartData);
        }
        [HttpGet]
        [Route("umbraco/backoffice/api/ViewAnalytics/GetAggregatedChartData")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAggregatedChartData([FromQuery] DateTime start, [FromQuery] DateTime end)
        {
            try
            {
                var rawViews = await _analyticsService.GetPageViewsByDateRangeAsync(start, end);
                var aggregatedData = _aggregationService.AggregatePageViews(rawViews);

                var response = aggregatedData.Select(point => new
                {
                    date = point.Date.ToString("yyyy-MM-dd"),
                    pageViews = point.PageViews,
                    dailyTotal = point.DailyTotal
                });

                return Content(JsonConvert.SerializeObject(response, new JsonSerializerSettings
                {
                    ContractResolver = new CamelCasePropertyNamesContractResolver()
                }), "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching aggregated page views");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }
    }
}