using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace DDEyC.Models
{
    public class Survey
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<SurveyQuestion> Questions { get; set; } = new List<SurveyQuestion>();
        public List<SurveyResult> Results { get; set; } = new List<SurveyResult>();
    }

    public class SurveyQuestion
    {
        public int Id { get; set; }
        public string QuestionText { get; set; }
        public int SurveyId { get; set; }
        [JsonIgnore]
        public Survey? Survey { get; set; }

        public List<SurveyAnswer> Answers { get; set; } = new List<SurveyAnswer>();
    }

    public class SurveyResult
    {
        public int Id { get; set; }
        public int SurveyId { get; set; }
        [JsonIgnore]
        public Survey? Survey { get; set; }
        public DateTime SubmittedAt { get; set; }
        [Required]
        public string Name { get; set; }
        [EmailAddress]
        public string? Email { get; set; }
        [Phone]
        public string? Phone { get; set; }
        public List<SurveyAnswer> Answers { get; set; } = new List<SurveyAnswer>();
    }

    public class SurveyAnswer
    {
        public int Id { get; set; }
        public int QuestionId { get; set; }
        [JsonIgnore]
        public SurveyQuestion? Question { get; set; }
        public string AnswerText { get; set; }
        public int SurveyResultId { get; set; }
        [JsonIgnore]
        public SurveyResult? SurveyResult { get; set; }
    }
   public class SurveySubmissionRequest
    {
        [Required]
        public string Name { get; set; }
        [EmailAddress]
        public string? Email { get; set; }
        [Phone]
        public string? Phone { get; set; }
        [Required]
        public List<QuestionAnswer> Questions { get; set; }
    }

    public class QuestionAnswer
    {
        [Required]
        public string Text { get; set; }
        [Required]
        public string Answer { get; set; }
    }

    public class SurveySubmissionResult
    {
        public int SurveyId { get; set; }
        public int ResultId { get; set; }
        public bool IsNewSurvey { get; set; }
    }
     public class SurveyListItem
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime CreatedAt { get; set; }
        public int QuestionCount { get; set; }
        public int ResponseCount { get; set; }
    }

    public class SurveyDetails
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<string> Questions { get; set; }
        public int ResponseCount { get; set; }
    }

    public class SurveyResultDetails
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public DateTime SubmittedAt { get; set; }
        public List<AnswerDetails> Answers { get; set; }
    }

    public class AnswerDetails
    {
        public string QuestionText { get; set; }
        public string AnswerText { get; set; }
    }

    public class SurveySummary
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime CreatedAt { get; set; }
        public int TotalResponses { get; set; }
        public List<QuestionSummary> QuestionSummaries { get; set; }
    }

    public class QuestionSummary
    {
        public string QuestionText { get; set; }
        public int AnswerCount { get; set; }
        public int UniqueAnswers { get; set; }
        public List<AnswerFrequency> TopAnswers { get; set; }
    }

    public class AnswerFrequency
    {
        public string AnswerText { get; set; }
        public int Frequency { get; set; }
    }
}