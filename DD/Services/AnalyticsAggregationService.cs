using DDEyC.Models;

namespace DDEyC.Services
{
    public interface IAnalyticsAggregationService
    {
        IEnumerable<AggregatedPoint> AggregatePageViews(IEnumerable<AnalyticsView> views);
    }

    public class AnalyticsAggregationService : IAnalyticsAggregationService
    {
        private const int MAX_POINTS = 56;

        public IEnumerable<AggregatedPoint> AggregatePageViews(IEnumerable<AnalyticsView> views)
        {
            // Group by date first
            var dailyGroups = views
                .GroupBy(v => v.Timestamp.Date)
                .OrderBy(g => g.Key)
                .ToList();

            // If we have fewer points than MAX_POINTS, just return daily data
            if (dailyGroups.Count <= MAX_POINTS)
            {
                return dailyGroups.Select(g => new AggregatedPoint
                {
                    Date = g.Key,
                    PageViews = g.GroupBy(v => v.Url)
                                .ToDictionary(
                                    urlGroup => urlGroup.Key,
                                    urlGroup => urlGroup.Count()
                                ),
                    DailyTotal = g.Count()
                });
            }

            // Calculate how many days to group together
            int groupSize = (int)Math.Ceiling(dailyGroups.Count / (double)MAX_POINTS);

            return dailyGroups
                .Select((group, index) => new { Group = group, Index = index })
                .GroupBy(x => x.Index / groupSize)
                .Select(g =>
                {
                    var dateRange = g.SelectMany(x => x.Group);
                    var startDate = g.First().Group.Key;

                    var aggregatedPoint = new AggregatedPoint
                    {
                        Date = startDate,
                        DailyTotal = (int)Math.Round(dateRange.Count() / (double)g.Count())
                    };

                    // Aggregate page views for each URL
                    var urlGroups = dateRange.GroupBy(v => v.Url);
                    foreach (var urlGroup in urlGroups)
                    {
                        aggregatedPoint.PageViews[urlGroup.Key] =
                            (int)Math.Round(urlGroup.Count() / (double)g.Count());
                    }

                    return aggregatedPoint;
                });
        }
    }
}