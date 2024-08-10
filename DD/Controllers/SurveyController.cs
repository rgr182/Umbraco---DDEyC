using DDEyC.Models;
using DDEyC.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;

namespace DDEyC.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
    public class SurveyController : ControllerBase
    {
        private readonly SurveyService _surveyService;
        private readonly ILogger<SurveyController> _logger;

        public SurveyController(SurveyService surveyService, ILogger<SurveyController> logger)
        {
            _surveyService = surveyService;
            _logger = logger;
        }

        [HttpGet("{id}")]
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

        [HttpGet("{id}/results")]
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

        [HttpGet("{id}/summary")]
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

        [HttpGet("list")]
        public async Task<IActionResult> GetSurveyList()
        {
            try
            {
                var surveys = await _surveyService.GetSurveyListAsync();
                return Ok(surveys);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching survey list");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateSurvey([FromBody] Survey survey)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var createdSurvey = await _surveyService.CreateSurveyAsync(survey);
                return CreatedAtAction("CreateSurvey", new { id = createdSurvey.Id }, createdSurvey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating survey");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpPost("submit")]
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

        [HttpPost("{id}/submit")]
        [AllowAnonymous]
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
    }
}