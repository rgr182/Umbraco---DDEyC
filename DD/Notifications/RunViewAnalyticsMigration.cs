using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using DDEyC.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

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
            _logger.LogInformation("RunViewAnalyticsMigration handler triggered");
            try
            {
                var migrations = _analyticsContext.Database.GetMigrations().ToList();
                _logger.LogInformation($"Found {migrations.Count} migrations: {string.Join(", ", migrations)}");

                var pendingMigrations = _analyticsContext.Database.GetPendingMigrations().ToList();
                _logger.LogInformation($"Pending migrations: {string.Join(", ", pendingMigrations)}");

                if (pendingMigrations.Any())
                {
                    _logger.LogInformation("Applying pending migrations");
                    _analyticsContext.Database.Migrate();
                    _logger.LogInformation("Migrations applied successfully");
                }
                else
                {
                    _logger.LogInformation("No pending migrations to apply");
                }

                var tableExists = _analyticsContext.Database.GetAppliedMigrations().Any();
                _logger.LogInformation($"SiteViews table exists: {tableExists}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during migration process");
            }
        }
    }
}