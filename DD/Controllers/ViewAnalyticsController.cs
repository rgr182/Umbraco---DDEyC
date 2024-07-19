using System;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Cms.Web.Common.Attributes;
using DDEyC.Services;

namespace YourNamespace.Controllers
{
    [PluginController("Analytics")]
    public class AnalyticsApiController : UmbracoAuthorizedApiController
    {
        private readonly ViewAnalyticsService _analyticsService;

        public AnalyticsApiController(ViewAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        [HttpGet]
        public IActionResult GetAllPageViews()
        {
            var pageViews = _analyticsService.GetAllPageViews();
            return Ok(pageViews);
        }

        [HttpGet]
        public IActionResult GetPageViewsByDateRange(DateTime start, DateTime end)
        {
            var pageViews = _analyticsService.GetPageViewsByDateRange(start, end);
            return Ok(pageViews);
        }
    }
}