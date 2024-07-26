using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Dashboards;

namespace DDEyC.Dashboards
{
    [Weight(10)]
    public class AnalyticsDashboard : IDashboard
    {
        public string Alias => "analyticsDashboard";
        public string[] Sections => new[] { "content" };
        public string View => "/Partials/BackOffice/Analytics.cshtml";
        public IAccessRule[] AccessRules => Array.Empty<IAccessRule>();
    }
}