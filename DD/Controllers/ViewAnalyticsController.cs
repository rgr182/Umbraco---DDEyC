using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.BackOffice.Controllers;
using DDEyC.Services;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace DDEyC.Controllers
{
    public class ViewAnalyticsController : UmbracoAuthorizedApiController
    {
        private readonly ViewAnalyticsService _analyticsService;
        private readonly ILogger<ViewAnalyticsController> _logger;

        public ViewAnalyticsController(ViewAnalyticsService analyticsService, ILogger<ViewAnalyticsController> logger)
        {
            _analyticsService = analyticsService;
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
    }
}