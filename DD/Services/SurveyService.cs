using DDEyC.Models;
using DDEyC.Repositories;

namespace DDEyC.Services
{
    public class SurveyService
    {
        private readonly SurveyRepository _repository;
        private readonly ILogger<SurveyService> _logger;

        public SurveyService(SurveyRepository repository, ILogger<SurveyService> logger)
        {
            _repository = repository;
            _logger = logger;
        }
         public async Task<SurveySubmissionResult> SubmitSurveyResponseAsync(SurveySubmissionRequest request)
        {
            var existingSurvey = await _repository.GetSurveyByQuestionsAsync(request.Questions.Select(q => q.Text).ToList());
            bool isNewSurvey = false;

            if (existingSurvey == null)
            {
                // Create new survey
                existingSurvey = new Survey
                {
                    Name = $"Survey_{DateTime.UtcNow:yyyyMMddHHmmss}",
                    CreatedAt = DateTime.UtcNow,
                    Questions = request.Questions.Select(q => new SurveyQuestion { QuestionText = q.Text }).ToList()
                };
                
                await _repository.CreateSurveyAsync(existingSurvey);
                isNewSurvey = true;
            }

            // Create survey result
            var surveyResult = new SurveyResult
            {
                SurveyId = existingSurvey.Id,
                SubmittedAt = DateTime.UtcNow,
                Name = request.Name,
                Email = request.Email,
                Phone = request.Phone,
                Answers = request.Questions.Select(q => new SurveyAnswer
                {
                    QuestionId = existingSurvey.Questions.First(sq => sq.QuestionText == q.Text).Id,
                    AnswerText = q.Answer
                }).ToList()
            };

            await _repository.CreateSurveyResultAsync(surveyResult);

            return new SurveySubmissionResult
            {
                SurveyId = existingSurvey.Id,
                ResultId = surveyResult.Id,
                IsNewSurvey = isNewSurvey
            };
        }
        public async Task<Survey> CreateSurveyAsync(Survey survey)
        {
            survey.CreatedAt = DateTime.UtcNow;
            return await _repository.CreateSurveyAsync(survey);
        }

        public async Task<Survey> GetSurveyAsync(int id)
        {
            return await _repository.GetSurveyByIdAsync(id);
        }
         public async Task<List<SurveyListItem>> GetSurveyListAsync()
        {
            var surveys = await _repository.GetAllSurveysAsync();
            return surveys.Select(s => new SurveyListItem
            {
                Id = s.Id,
                Name = s.Name,
                CreatedAt = s.CreatedAt,
                QuestionCount = s.Questions.Count,
                ResponseCount = s.Results.Count
            }).ToList();
        }

        public async Task<SurveyDetails> GetSurveyDetailsAsync(int id)
        {
            var survey = await _repository.GetSurveyByIdAsync(id);
            if (survey == null)
                return null;

            return new SurveyDetails
            {
                Id = survey.Id,
                Name = survey.Name,
                CreatedAt = survey.CreatedAt,
                Questions = survey.Questions.Select(q => q.QuestionText).ToList(),
                ResponseCount = survey.Results.Count
            };
        }

        public async Task<List<SurveyResultDetails>> GetSurveyResultsAsync(int id)
        {
            var results = await _repository.GetSurveyResultsBySurveyIdAsync(id);
            return results.Select(r => new SurveyResultDetails
            {
                Id = r.Id,
                Name = r.Name,
                Email = r.Email,
                Phone = r.Phone,
                SubmittedAt = r.SubmittedAt,
                Answers = r.Answers.Select(a => new AnswerDetails
                {
                    QuestionText = a.Question.QuestionText,
                    AnswerText = a.AnswerText
                }).ToList()
            }).ToList();
        }

        public async Task<SurveySummary> GetSurveySummaryAsync(int id)
        {
            var survey = await _repository.GetSurveyByIdAsync(id);
            if (survey == null)
                return null;

            var summary = new SurveySummary
            {
                Id = survey.Id,
                Name = survey.Name,
                CreatedAt = survey.CreatedAt,
                TotalResponses = survey.Results.Count,
                QuestionSummaries = survey.Questions.Select(q => new QuestionSummary
                {
                    QuestionText = q.QuestionText,
                    AnswerCount = q.Answers.Count,
                    UniqueAnswers = q.Answers.Select(a => a.AnswerText).Distinct().Count(),
                    TopAnswers = q.Answers
                        .GroupBy(a => a.AnswerText)
                        .OrderByDescending(g => g.Count())
                        .Take(5)
                        .Select(g => new AnswerFrequency
                        {
                            AnswerText = g.Key,
                            Frequency = g.Count()
                        }).ToList()
                }).ToList()
            };

            return summary;
        }
        public async Task<SurveyResult> SubmitSurveyResultAsync(SurveyResult result)
        {
            result.SubmittedAt = DateTime.UtcNow;
            return await _repository.CreateSurveyResultAsync(result);
        }

       
    }
}