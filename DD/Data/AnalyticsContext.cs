using Microsoft.EntityFrameworkCore;
using DDEyC.Models;

namespace DDEyC.Data
{
    public class AnalyticsContext : DbContext
    {
        public AnalyticsContext(DbContextOptions<AnalyticsContext> options)
            : base(options)
        {
        }

        public DbSet<AnalyticsView> SiteViews { get; set; }
        public DbSet<SurveyResult> SurveyResults { get; set; }
        public DbSet<SurveyQuestion> SurveyQuestions { get; set; }
        public DbSet<SurveyAnswer> SurveyAnswers { get; set; }
        public DbSet<Survey> Surveys { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<AnalyticsView>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Url).IsRequired();
                entity.Property(e => e.Timestamp).IsRequired();
            });
             modelBuilder.Entity<SurveyQuestion>(entity =>
            {
                entity.ToTable("SurveyQuestions");
                entity.HasKey(e => e.Id);
            
                entity.Property(e => e.QuestionText).IsRequired();
                
            });

            modelBuilder.Entity<SurveyAnswer>(entity =>
            {
                entity.ToTable("SurveyAnswers");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.AnswerText).IsRequired();

                // Foreign key configuration for SurveyResult
                entity.HasOne(e => e.SurveyResult)
                    .WithMany(s => s.Answers)
                    .HasForeignKey(e => e.SurveyResultId)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            modelBuilder.Entity<SurveyResult>(entity =>
            {
                entity.ToTable("SurveyResults");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.SurveyId).IsRequired();
            });
 modelBuilder.Entity<Survey>(entity =>
            {
                entity.ToTable("Surveys");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.HasMany(e => e.Questions)
                    .WithOne(q => q.Survey)
                    .HasForeignKey(q => q.SurveyId);
                entity.HasMany(e => e.Results)
                    .WithOne(r => r.Survey)
                    .HasForeignKey(r => r.SurveyId);
            });
           
        }
    }
}