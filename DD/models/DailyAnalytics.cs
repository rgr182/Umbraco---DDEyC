namespace DDEyC.Models{

public class DailyAnalytics
{
    public DateTime Date { get; set; }
    public Dictionary<string, int> PageViews { get; set; } = new Dictionary<string, int>();
    public int DailyTotal { get; set; }
}
}