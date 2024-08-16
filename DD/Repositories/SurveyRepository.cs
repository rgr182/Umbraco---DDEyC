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
            _logger = logger;
            _context = context;
        }

        public async Task<Survey> CreateSurveyAsync(Survey survey)
        {
            _context.Surveys.Add(survey);
            await _context.SaveChangesAsync();
            return survey;
        }
        public async Task<Survey> GetSurveyByQuestionsAsync(List<string> questions)
        {
            return await _context.Surveys
                .Include(s => s.Questions)
                .AsSplitQuery()
                .FirstOrDefaultAsync(s => s.Questions.Count == questions.Count &&
                    s.Questions.All(q => questions.Contains(q.QuestionText)));
        }
         public async Task<List<Survey>> GetAllSurveysAsync()
        {
            return await _context.Surveys
                .Include(s => s.Questions)
                .Include(s => s.Results)
                .AsSplitQuery()
                .ToListAsync();
        }

        public async Task<Survey> GetSurveyByIdAsync(int id)
        {
            return await _context.Surveys
                .Include(s => s.Questions)
                .Include(s => s.Results)
                    .ThenInclude(r => r.Answers)
                        .ThenInclude(a => a.Question)
                .AsSplitQuery()
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<SurveyResult> CreateSurveyResultAsync(SurveyResult result)
        {
            _context.SurveyResults.Add(result);
            await _context.SaveChangesAsync();
            return result;
        }

        public async Task<List<SurveyResult>> GetSurveyResultsBySurveyIdAsync(int surveyId)
        {
            return await _context.SurveyResults
                .Include(r => r.Answers)
                    .ThenInclude(a => a.Question)
                .Where(r => r.SurveyId == surveyId)
                .AsSplitQuery()
                .ToListAsync();
        }
         public async Task<bool> DeleteSurveyAsync(int id)
        {
            var survey = await _context.Surveys.FindAsync(id);
            if (survey == null)
            {
                return false;
            }

            _context.Surveys.Remove(survey);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Survey> UpdateSurveyAsync(Survey survey)
        {
            _context.Entry(survey).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return survey;
        }
        
       public async Task<List<Survey>> GetPagedSurveysAsync(int page, int pageSize, string searchQuery, DateTime? fromDate, DateTime? toDate)
        {
            try
            {
                _logger.LogInformation($"GetPagedSurveysAsync called with page: {page}, pageSize: {pageSize}, searchQuery: {searchQuery}, fromDate: {fromDate}, toDate: {toDate}");

                var query = _context.Surveys
                    .Include(s => s.Questions)
                    .Include(s => s.Results)
                    .AsQueryable();

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

                var results = await query
                    .OrderByDescending(s => s.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .AsSplitQuery()
                    .ToListAsync();

                _logger.LogInformation($"GetPagedSurveysAsync returning {results.Count} items");

                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetPagedSurveysAsync");
                throw;
            }
        }

        public async Task<int> GetTotalSurveyCountAsync(string searchQuery, DateTime? fromDate, DateTime? toDate)
        {
            try
            {
                _logger.LogInformation($"GetTotalSurveyCountAsync called with searchQuery: {searchQuery}, fromDate: {fromDate}, toDate: {toDate}");

                var query = _context.Surveys.AsQueryable();

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

                var count = await query.CountAsync();

                _logger.LogInformation($"GetTotalSurveyCountAsync returning count: {count}");

                return count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetTotalSurveyCountAsync");
                throw;
            }
        }
    }
}