using DDEyC.Models;
using DDEyC.Services;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Cms.Web.Common.Attributes;
using Microsoft.AspNetCore.Authorization;

namespace DDEyC.Controllers
{
    [PluginController("DDEyC")]
    public class SurveyController : UmbracoAuthorizedApiController
    {
        private readonly SurveyService _surveyService;
        private readonly ILogger<SurveyController> _logger;

        public SurveyController(SurveyService surveyService, ILogger<SurveyController> logger)
        {
            _surveyService = surveyService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetSurveyList([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchQuery = "", [FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            try
            {
                _logger.LogInformation($"GetSurveyList called with page: {page}, pageSize: {pageSize}, searchQuery: {searchQuery}, fromDate: {fromDate}, toDate: {toDate}");
                
                var pagedResult = await _surveyService.GetPagedSurveyListAsync(page, pageSize, searchQuery, fromDate, toDate);
                
                return Content(Newtonsoft.Json.JsonConvert.SerializeObject(new
                {
                    Items = pagedResult.Items,
                    TotalItems = pagedResult.TotalItems,
                    Page = pagedResult.Page,
                    PageSize = pagedResult.PageSize
                }), "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching paged survey list");
                return StatusCode(500, new { error = "An unexpected error occurred. Please try again later." });
            }
        }
        [HttpGet("/umbraco/backoffice/DDEyC/Survey/details/{id}")]
        public async Task<IActionResult> GetSurveyDetails(int id)
        {
            try
            {
                var survey = await _surveyService.GetSurveyDetailsAsync(id);
                if (survey == null)
                    return NotFound();
                return Ok(survey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching survey details");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpGet("/umbraco/backoffice/DDEyC/Survey/results/{id}")]
        public async Task<IActionResult> GetSurveyResults(int id)
        {
            try
            {
                var results = await _surveyService.GetSurveyResultsAsync(id);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching survey results");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpGet("/umbraco/backoffice/DDEyC/Survey/summary/{id}")]
        public async Task<IActionResult> GetSurveySummary(int id)
        {
            try
            {
                var summary = await _surveyService.GetSurveySummaryAsync(id);
                if (summary == null)
                    return NotFound();
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching survey summary");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpPost("/api/Survey")]
        public async Task<IActionResult> CreateSurvey([FromBody] Survey survey)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var createdSurvey = await _surveyService.CreateSurveyAsync(survey);
                return CreatedAtAction(nameof(GetSurveyDetails), new { id = createdSurvey.Id }, createdSurvey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating survey");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpPost("api/Survey/submit")]
        [AllowAnonymous]
        public async Task<IActionResult> SubmitSurveyResponse([FromBody] SurveySubmissionRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _surveyService.SubmitSurveyResponseAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while submitting survey response");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpPost("result/{id}")]
        public async Task<IActionResult> SubmitSurveyResult(int id, [FromBody] SurveyResult result)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != result.SurveyId)
            {
                return BadRequest("Survey ID mismatch");
            }

            try
            {
                var submittedResult = await _surveyService.SubmitSurveyResultAsync(result);
                return Ok(submittedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while submitting survey result");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSurvey(int id, [FromBody] Survey survey)
        {
            if (id != survey.Id)
            {
                return BadRequest("Survey ID mismatch");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var updatedSurvey = await _surveyService.UpdateSurveyAsync(id, survey);
                return Ok(updatedSurvey);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating survey");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSurvey(int id)
        {
            try
            {
                var result = await _surveyService.DeleteSurveyAsync(id);
                if (!result)
                {
                    return NotFound();
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting survey");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }
    }
}