using System;
using NPoco;

namespace DDEyC.Models
{
    [TableName("SiteViews")]
    [PrimaryKey("Id")]
    public class AnalyticsView
    {
        public int Id { get; set; }
        public string Url { get; set; }
        public DateTime Timestamp { get; set; }
        public string UserAgent { get; set; }
        public string IpAddress { get; set; }
    }
}