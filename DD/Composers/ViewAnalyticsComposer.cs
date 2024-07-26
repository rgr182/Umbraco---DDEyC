using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using DDEyC.Notifications;
using Umbraco.Cms.Core.Notifications;

namespace DDEyC.Composers
{
    public class ViewAnalyticsComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.AddNotificationAsyncHandler<UmbracoApplicationStartingNotification, RunViewAnalyticsMigration>();
        }
    }
}