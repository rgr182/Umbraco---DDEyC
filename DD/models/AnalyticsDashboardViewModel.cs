namespace DDEyC.Models{
    public class AnalyticsDashboardViewModel
{
    public List<DailyAnalytics> DailyStats { get; set; } = new List<DailyAnalytics>();
    public Dictionary<string, int> PageTotals { get; set; } = new Dictionary<string, int>();
    public int GrandTotal { get; set; }
    public List<string> UniqueUrls { get; set; } = new List<string>();
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class DailyAnalytics
{
    public DateTime Date { get; set; }
    public Dictionary<string, int> PageViews { get; set; } = new Dictionary<string, int>();
    public int DailyTotal { get; set; }
}
}