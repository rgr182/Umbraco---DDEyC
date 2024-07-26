using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using DDEyC.Data;
using Microsoft.EntityFrameworkCore;

namespace DDEyC.Notifications
{
    public class RunViewAnalyticsMigration : INotificationAsyncHandler<UmbracoApplicationStartingNotification>
    {
        private readonly AnalyticsContext _analyticsContext;

        public RunViewAnalyticsMigration(AnalyticsContext blogContext)
        {
            _analyticsContext = blogContext;
        }

        public async Task HandleAsync(UmbracoApplicationStartingNotification notification, CancellationToken cancellationToken)
        {
            await _analyticsContext.Database.MigrateAsync(cancellationToken);
        }
    }
}