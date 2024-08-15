using DDEyC.Data;
using DDEyC.Notifications;
using DDEyC.Repositories;
using DDEyC.Services;
using Microsoft.EntityFrameworkCore;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Dashboards;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Sections;
using Umbraco.Cms.Core.Services;


namespace DDEyC.Composers
{
     public class SurveyComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.AddTransient<SurveyRepository>();
            builder.Services.AddTransient<SurveyService>();
            var loggerFactory = builder.Services.BuildServiceProvider().GetRequiredService<ILoggerFactory>();
            var logger = loggerFactory.CreateLogger<SurveyComposer>();
            
            logger.LogWarning("SurveyComposer Compose method started");

            try
            {
                logger.LogWarning("Adding SurveySection");
                builder.Sections().Append<SurveySection>();

                logger.LogWarning("Adding SurveyDashboard");
                builder.Dashboards().Add<SurveyDashboard>();

                logger.LogWarning("Adding AddSurveySectionToAdminUsers component");
                builder.Components().Append<AddSurveySectionToAdminUsers>();

                logger.LogWarning("SurveyComposer configuration completed");
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, "Error occurred in SurveyComposer");
            }
        }
    }
     public class SurveySection : ISection
    {
        public static readonly string SectionAlias = "surveys";

        public string Alias => SectionAlias;
        public string Name => "Surveys";
        public string Icon => "icon-poll";
        public int SortOrder => 105; // After Analytics
    }
      public class SurveyDashboard : IDashboard
    {
        public string Alias => "surveyDashboard";
        public string View => "/App_Plugins/SurveyDashboard/surveyDashboard.html";
        public string[] Sections => new[] { SurveySection.SectionAlias };
        public IAccessRule[] AccessRules => Array.Empty<IAccessRule>();
    }

    public class AddSurveySectionToAdminUsers : IComponent
    {
        private readonly ILogger<AddSurveySectionToAdminUsers> _logger;
        private readonly IUserService _userService;
        private readonly IRuntimeState _runtimeState;

        public AddSurveySectionToAdminUsers(IUserService userService, ILogger<AddSurveySectionToAdminUsers> logger, IRuntimeState runtimeState)
        {
            _userService = userService;
            _logger = logger;
            _runtimeState = runtimeState;
        }

        public void Initialize()
        {
            _logger.LogWarning("AddSurveySectionToAdminUsers Initialize method started");
            try
            {
                if (_runtimeState.Level != RuntimeLevel.Install){
                    _logger.LogWarning("AddSurveySectionToAdminUsers Initialize method skipped, running on install mode");
                    return;
                } 
                var adminGroup = _userService.GetUserGroupByAlias("admin");
                if (adminGroup != null)
                {
                    _logger.LogWarning($"Admin group found. Current allowed sections: {string.Join(", ", adminGroup.AllowedSections)}");
                    if (!adminGroup.AllowedSections.Contains(SurveySection.SectionAlias))
                    {
                        _logger.LogWarning($"Adding SurveySection ({SurveySection.SectionAlias}) to admin group");
                        adminGroup.AddAllowedSection(SurveySection.SectionAlias);
                        _userService.Save(adminGroup);
                        _logger.LogWarning($"SurveySection added. Updated allowed sections: {string.Join(", ", adminGroup.AllowedSections)}");
                    }
                    else
                    {
                        _logger.LogWarning("SurveySection already exists in admin group");
                    }
                }
                else
                {
                    _logger.LogWarning("Admin group not found");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred in AddSurveySectionToAdminUsers");
            }
        }

        public void Terminate() 
        {
            _logger.LogWarning("AddSurveySectionToAdminUsers Terminate method called");
        }
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
 