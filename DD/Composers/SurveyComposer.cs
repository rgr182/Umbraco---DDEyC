using DDEyC.Data;
using DDEyC.Notifications;
using DDEyC.Repositories;
using DDEyC.Services;
using Microsoft.EntityFrameworkCore;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;


namespace DDEyC.Composers
{
    public class SurveyComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.AddTransient<SurveyRepository>();
            builder.Services.AddTransient<SurveyService>();
        }
    }

    public class RunSurveyMigrations : INotificationHandler<UmbracoApplicationStartingNotification>
    {
        private readonly AnalyticsContext _context;

        public RunSurveyMigrations(AnalyticsContext context)
        {
            _context = context;
        }

        public void Handle(UmbracoApplicationStartingNotification notification)
        {
            _context.Database.Migrate();
        }
    }
}