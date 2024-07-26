using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DDEyC.Models
{
    [Table("SiteViews")]
    public class AnalyticsView
    {
        [Key]
        public int Id { get; set; }
        public required string Url { get; set; }
        public DateTime Timestamp { get; set; }
        public string UserAgent { get; set; }
        public string IpAddress { get; set; }
    }
}