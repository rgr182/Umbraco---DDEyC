using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Dashboards;

namespace YourNamespace.Dashboards
{
    [Weight(10)]
    public class AnalyticsDashboard : IDashboard
    {
        public string Alias => "analyticsDashboard";
        public string[] Sections => new[] { "content" };
        public string View => "/App_Plugins/AnalyticsDashboard/AnalyticsDashboard.html";
        public IAccessRule[] AccessRules => Array.Empty<IAccessRule>();
    }
}