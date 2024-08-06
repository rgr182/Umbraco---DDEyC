using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using DDEyC.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Data;

namespace DDEyC.Notifications
{
    public class RunViewAnalyticsMigration : INotificationHandler<UmbracoApplicationStartingNotification>
    {
        private readonly AnalyticsContext _analyticsContext;
        private readonly ILogger<RunViewAnalyticsMigration> _logger;

        public RunViewAnalyticsMigration(AnalyticsContext analyticsContext, ILogger<RunViewAnalyticsMigration> logger)
        {
            _analyticsContext = analyticsContext;
            _logger = logger;
        }

        public void Handle(UmbracoApplicationStartingNotification notification)
        {
            _logger.LogInformation("RunViewAnalyticsMigration handler triggered for analytics and surveys");
            try
            {
                var migrations = _analyticsContext.Database.GetMigrations().ToList();
                _logger.LogInformation($"Found {migrations.Count} total migrations: {string.Join(", ", migrations)}");

                var pendingMigrations = _analyticsContext.Database.GetPendingMigrations().ToList();
                _logger.LogInformation($"Pending migrations: {string.Join(", ", pendingMigrations)}");

                if (pendingMigrations.Any())
                {
                    _logger.LogInformation("Applying pending migrations for analytics and surveys");
                    _analyticsContext.Database.Migrate();
                    _logger.LogInformation("Migrations applied successfully");
                }
                else
                {
                    _logger.LogInformation("No pending migrations to apply for analytics or surveys");
                }

                var appliedMigrations = _analyticsContext.Database.GetAppliedMigrations().ToList();
                _logger.LogInformation($"Applied migrations: {string.Join(", ", appliedMigrations)}");

                // Check for specific tables
                var tablesToCheck = new[] { "SiteViews", "SurveyResults", "SurveyQuestions", "SurveyAnswers" };
                foreach (var tableName in tablesToCheck)
                {
                    var tableExists = CheckTableExists(tableName);
                    _logger.LogInformation($"{tableName} table exists: {tableExists}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during migration process for analytics and surveys");
            }
        }

        private bool CheckTableExists(string tableName)
        {
            try
            {
                // This query works across different database providers
                var sql = $"SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = @tableName";
                var parameter = new Microsoft.Data.SqlClient.SqlParameter("@tableName", tableName);
                
                var result = _analyticsContext.Database.ExecuteSqlRaw(sql, parameter);
                return result > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking if table {tableName} exists");
                return false;
            }
        }
    }
}