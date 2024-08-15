using DDEyC.Notifications;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Sections;
using Umbraco.Cms.Core.Services;


namespace DDEyC.Composers
{
    public class AnalyticsDashboardComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.AddNotificationHandler<UmbracoApplicationStartingNotification, RunViewAnalyticsMigration>();

            builder.Sections().Append<AnalyticsSection>();

            builder.Components().Append<AddAnalyticsSectionToAdminUsers>();


        }
    }

    public class AnalyticsSection : ISection
    {
        public static readonly string SectionAlias = "analytics";

        public string Alias => SectionAlias;
        public string Name => "Analytics";
        public string Icon => "icon-chart-curve";
        public int SortOrder => 100;
    }

    public class AddAnalyticsSectionToAdminUsers : IComponent
    {
        private readonly IUserService _userService;
        private readonly IRuntimeState _runtimeState;

        public AddAnalyticsSectionToAdminUsers(IUserService userService, IRuntimeState runtimeState)
        {
            _userService = userService;
            _runtimeState = runtimeState;
        }

        public void Initialize()
        {
            if (!_runtimeState.Level.Equals(RuntimeLevel.Install)){
                return;
            }
            var adminGroup = _userService.GetUserGroupByAlias("admin");
            if (adminGroup != null && !adminGroup.AllowedSections.Contains(AnalyticsSection.SectionAlias))
            {
                adminGroup.AddAllowedSection(AnalyticsSection.SectionAlias);
                _userService.Save(adminGroup);
            }
        }

        public void Terminate() { }
    }
}