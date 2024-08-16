using DDEyC.Data;
using DDEyC.Models;
using Microsoft.EntityFrameworkCore;

namespace DDEyC.Repositories
{
    public class SurveyRepository
    {
        private readonly AnalyticsContext _context;
        private readonly ILogger<SurveyRepository> _logger;

        public SurveyRepository(AnalyticsContext context, ILogger<SurveyRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<(List<Survey> Surveys, int TotalCount)> GetPagedSurveysAsync(int page, int pageSize, string searchQuery, DateTime? fromDate, DateTime? toDate)
        {
            try
            {
                _logger.LogInformation($"GetPagedSurveysAsync called with page: {page}, pageSize: {pageSize}, searchQuery: {searchQuery}, fromDate: {fromDate}, toDate: {toDate}");

                var query = _context.Surveys
                    .Include(s => s.Questions)
                    .Include(s => s.Results)
                    .AsQueryable();

                // Apply filters
                if (!string.IsNullOrEmpty(searchQuery))
                {
                    query = query.Where(s => s.Name.Contains(searchQuery));
                }

                if (fromDate.HasValue)
                {
                    query = query.Where(s => s.CreatedAt >= fromDate.Value);
                }

                if (toDate.HasValue)
                {
                    query = query.Where(s => s.CreatedAt <= toDate.Value);
                }

                // Get total count for pagination
                var totalCount = await query.CountAsync();

                // Apply pagination
                var surveys = await query
                    .OrderByDescending(s => s.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .AsSplitQuery()
                    .ToListAsync();

                _logger.LogInformation($"GetPagedSurveysAsync returning {surveys.Count} surveys out of {totalCount} total");

                return (surveys, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPagedSurveysAsync");
                throw;
            }
        }

        public async Task<Survey> GetSurveyByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation($"GetSurveyByIdAsync called with id: {id}");

                var survey = await _context.Surveys
                    .Include(s => s.Questions)
                    .Include(s => s.Results)
                        .ThenInclude(r => r.Answers)
                            .ThenInclude(a => a.Question)
                    .AsSplitQuery()
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (survey == null)
                {
                    _logger.LogWarning($"Survey with id {id} not found");
                }

                return survey;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in GetSurveyByIdAsync with id: {id}");
                throw;
            }
        }

        public async Task<Survey> CreateSurveyAsync(Survey survey)
        {
            try
            {
                _logger.LogInformation("CreateSurveyAsync called");

                _context.Surveys.Add(survey);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Survey created with id: {survey.Id}");

                return survey;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateSurveyAsync");
                throw;
            }
        }

        public async Task<Survey> UpdateSurveyAsync(Survey survey)
        {
            try
            {
                _logger.LogInformation($"UpdateSurveyAsync called with id: {survey.Id}");

                _context.Entry(survey).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Survey updated with id: {survey.Id}");

                return survey;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in UpdateSurveyAsync with id: {survey.Id}");
                throw;
            }
        }

        public async Task<bool> DeleteSurveyAsync(int id)
        {
            try
            {
                _logger.LogInformation($"DeleteSurveyAsync called with id: {id}");

                var survey = await _context.Surveys.FindAsync(id);
                if (survey == null)
                {
                    _logger.LogWarning($"Survey with id {id} not found for deletion");
                    return false;
                }

                _context.Surveys.Remove(survey);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Survey deleted with id: {id}");

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in DeleteSurveyAsync with id: {id}");
                throw;
            }
        }

        public async Task<Survey> GetSurveyByQuestionsAsync(List<string> questions)
        {
            try
            {
                _logger.LogInformation($"GetSurveyByQuestionsAsync called with {questions.Count} questions");

                var survey = await _context.Surveys
                    .Include(s => s.Questions)
                    .AsSplitQuery()
                    .FirstOrDefaultAsync(s => s.Questions.Count == questions.Count &&
                        s.Questions.All(q => questions.Contains(q.QuestionText)));

                if (survey == null)
                {
                    _logger.LogWarning("No survey found matching the provided questions");
                }

                return survey;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetSurveyByQuestionsAsync");
                throw;
            }
        }

        public async Task<List<SurveyResult>> GetSurveyResultsBySurveyIdAsync(int surveyId)
        {
            try
            {
                _logger.LogInformation($"GetSurveyResultsBySurveyIdAsync called with surveyId: {surveyId}");

                var results = await _context.SurveyResults
                    .Include(r => r.Answers)
                        .ThenInclude(a => a.Question)
                    .Where(r => r.SurveyId == surveyId)
                    .AsSplitQuery()
                    .ToListAsync();

                _logger.LogInformation($"Retrieved {results.Count} results for survey id: {surveyId}");

                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in GetSurveyResultsBySurveyIdAsync with surveyId: {surveyId}");
                throw;
            }
        }

        public async Task<SurveyResult> CreateSurveyResultAsync(SurveyResult result)
        {
            try
            {
                _logger.LogInformation($"CreateSurveyResultAsync called for survey id: {result.SurveyId}");

                _context.SurveyResults.Add(result);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Survey result created with id: {result.Id}");

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateSurveyResultAsync");
                throw;
            }
        }
    }
}