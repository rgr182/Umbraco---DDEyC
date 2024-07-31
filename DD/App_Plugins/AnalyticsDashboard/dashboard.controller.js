(function () {
    'use strict';

    function analyticsDashboardController($scope, $q, $timeout, $filter, viewAnalyticsResource, notificationsService, dateHelper) {
        var vm = this;
        vm.pageViews = [];
        vm.filteredPageViews = [];
        vm.groupedPageViews = [];
        vm.loading = false;
        vm.dateFilter = {
            startDate: null,
            endDate: null
        };
        vm.urlFilter = '';
        vm.showPerPageViewsInTable = true;
        vm.showPerPageViewsInGraph = true;
        vm.showDailyTotals = true;
        vm.showOverallTotal = true;

        vm.loadPageViews = loadPageViews;
        vm.getChartData = getChartData;
        vm.applyFilters = applyFilters;
        vm.updateChart = updateChart;

        function formatDateForServer(date) {
            return date ? dateHelper.convertToServerStringTime(moment(date)) : null;
        }

        function loadPageViews() {
            if (!vm.dateFilter.startDate || !vm.dateFilter.endDate) {
                notificationsService.warning("Warning", "Please select both start and end dates.");
                return $q.reject("Invalid date range");
            }
            
            vm.loading = true;
            var startDate = formatDateForServer(vm.dateFilter.startDate);
            var endDate = formatDateForServer(vm.dateFilter.endDate);
            
            return viewAnalyticsResource.getPageViewsByDateRange(startDate, endDate)
                .then(function (response) {
                    vm.pageViews = response.data;
                    vm.groupedPageViews = groupPageViews(vm.pageViews);
                    applyFilters();
                    return response;
                })
                .catch(function (error) {
                    notificationsService.error("Error", "Failed to load page views: " + (error.message || 'Unknown error'));
                    vm.pageViews = [];
                    vm.groupedPageViews = [];
                    vm.filteredPageViews = [];
                    return $q.reject(error);
                })
                .finally(function () {
                    vm.loading = false;
                    $timeout(updateChart, 0);
                });
        }

        function groupPageViews(pageViews) {
            if (!Array.isArray(pageViews) || pageViews.length === 0) {
                return [];
            }

            var grouped = {};
            var overallTotal = 0;
            pageViews.forEach(function(view) {
                var date = $filter('date')(view.timestamp, 'yyyy-MM-dd');
                if (!grouped[date]) {
                    grouped[date] = {
                        date: date,
                        urls: {},
                        totalViews: 0
                    };
                }
                if (!grouped[date].urls[view.url]) {
                    grouped[date].urls[view.url] = 0;
                }
                grouped[date].urls[view.url]++;
                grouped[date].totalViews++;
                overallTotal++;
            });
            
            var result = Object.values(grouped).flatMap(day => 
                Object.entries(day.urls).map(([url, views]) => ({
                    date: day.date,
                    url: url,
                    views: views,
                    isTotal: false,
                    isPerPage: true
                })).concat({
                    date: day.date,
                    url: 'Total (' + day.date + ')',
                    views: day.totalViews,
                    isTotal: true,
                    isDailyTotal: true
                })
            );

            result.push({
                date: '',
                url: 'Overall Total',
                views: overallTotal,
                isTotal: true,
                isOverallTotal: true
            });

            return result.sort((a, b) => {
                if (a.date !== b.date) return a.date.localeCompare(b.date);
                if (a.isTotal) return 1;
                if (b.isTotal) return -1;
                return a.url.localeCompare(b.url);
            });
        }

        function applyFilters() {
            vm.filteredPageViews = (vm.groupedPageViews || []).filter(function(view) {
                var urlMatch = !vm.urlFilter || view.url.toLowerCase().includes(vm.urlFilter.toLowerCase());
                var showView = (vm.showPerPageViewsInTable && view.isPerPage) ||
                               (vm.showDailyTotals && view.isDailyTotal) ||
                               (vm.showOverallTotal && view.isOverallTotal);
                return urlMatch && showView;
            });
            updateChart();
        }

        function getChartData() {
            if (!Array.isArray(vm.groupedPageViews) || vm.groupedPageViews.length === 0) {
                return { labels: [], datasets: [] };
            }

            var groupedData = {};
            var pageUrls = new Set();

            vm.groupedPageViews.forEach(function (view) {
                if ((vm.showPerPageViewsInGraph && view.isPerPage) || 
                    (vm.showDailyTotals && view.isDailyTotal)) {
                    if (!groupedData[view.date]) {
                        groupedData[view.date] = {};
                    }
                    if (!groupedData[view.date][view.url]) {
                        groupedData[view.date][view.url] = 0;
                    }
                    groupedData[view.date][view.url] += view.views;
                    pageUrls.add(view.url);
                }
            });

            var sortedDates = Object.keys(groupedData).sort();
            var chartData = {
                labels: sortedDates,
                datasets: []
            };

            var urlArray = Array.from(pageUrls);
            urlArray.forEach((url, index) => {
                chartData.datasets.push({
                    label: url,
                    data: sortedDates.map(date => groupedData[date][url] || 0),
                    backgroundColor: getDistinctColor(index, urlArray.length),
                });
            });

            return chartData;
        }

        function getDistinctColor(index, total) {
            return `hsl(${(index * 360 / total) % 360}, 70%, 50%)`;
        }

        function updateChart() {
            var ctx = document.getElementById('pageViewsChart');
            if (!ctx) {
                return;
            }

            // Hide chart if both per-page views and daily totals are off
            if (!vm.showPerPageViewsInGraph && !vm.showDailyTotals) {
                if (vm.chart) {
                    vm.chart.destroy();
                    vm.chart = null;
                }
                ctx.style.display = 'none';
                return;
            }

            ctx.style.display = 'block';
            var chartData = vm.getChartData();

            var chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false, // Remove the legend
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        filter: function(tooltipItem) {
                            return tooltipItem.raw !== 0; // Only show non-zero values
                        },
                        callbacks: {
                            title: function(tooltipItems) {
                                return tooltipItems[0].label; // Show date
                            },
                            label: function(context) {
                                var label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y;
                                }
                                return label;
                            }
                        }
                    }
                }
            };

            if (vm.chart) {
                vm.chart.data = chartData;
                vm.chart.options = chartOptions;
                vm.chart.update();
            } else {
                vm.chart = new Chart(ctx, {
                    type: 'bar',
                    data: chartData,
                    options: chartOptions
                });
            }
        }
        function init() {
            vm.dateFilter.startDate = new Date(moment().subtract(30, 'days'));
            vm.dateFilter.endDate = new Date();
            loadPageViews();
        }

        $timeout(init, 0);
    }

    angular.module('umbraco').controller('AnalyticsDashboardController', ['$scope', '$q', '$timeout', '$filter', 'viewAnalyticsResource', 'notificationsService', 'dateHelper', analyticsDashboardController]);
})();