namespace DDEyC.Models
{
   public class AggregatedPoint
        {
            public DateTime Date { get; set; }
            public Dictionary<string, int> PageViews { get; set; } = new();
            public int DailyTotal { get; set; }
        }
}