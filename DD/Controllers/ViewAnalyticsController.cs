using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using DDEyC.Services;


namespace DDEyC.Controllers
{
    public class ViewAnalyticsController : UmbracoApiController
    {
        private readonly ViewAnalyticsService _analyticsService;
        private readonly ILogger<ViewAnalyticsController> _logger;

        public ViewAnalyticsController(ViewAnalyticsService analyticsService, ILogger<ViewAnalyticsController> logger)
        {
            _analyticsService = analyticsService;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllPageViews()
        {
            try
            {
                var pageViews = await _analyticsService.GetAllPageViewsAsync();
                return Ok(pageViews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching all page views");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
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
                return Ok(pageViews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching page views for date range: {Start} to {End}", start, end);
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }
    }
}