using DDEyC.Data;
using DDEyC.Models;
using Microsoft.EntityFrameworkCore;

namespace DDEyC.Repositories
{
    public class SurveyRepository
    {
        private readonly AnalyticsContext _context;

        public SurveyRepository(AnalyticsContext context)
        {
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
    }
}