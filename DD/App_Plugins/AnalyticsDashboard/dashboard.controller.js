(function () {
    'use strict';

    function analyticsDashboardController($scope, $q, $timeout, $filter, viewAnalyticsResource, notificationsService, dateHelper) {
        var vm = this;
        vm.pageViews = [];
        vm.groupedPageViews = [];
        vm.loading = false;
        vm.dateFilter = {
            startDate: null,
            endDate: null
        };

        vm.loadPageViews = loadPageViews;
        vm.getChartData = getChartData;

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
                    return response;
                })
                .catch(function (error) {
                    notificationsService.error("Error", "Failed to load page views");
                    return $q.reject(error);
                })
                .finally(function () {
                    vm.loading = false;
                    $timeout(createChart, 0);
                });
        }

        function groupPageViews(pageViews) {
            if (!Array.isArray(pageViews) || pageViews.length === 0) {
                return [];
            }

            var grouped = {};
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
            });
            
            return Object.values(grouped).flatMap(day => 
                Object.entries(day.urls).map(([url, views]) => ({
                    date: day.date,
                    url: url,
                    views: views,
                    isTotal: false
                })).concat({
                    date: day.date,
                    url: 'Total (' + day.date + ')',
                    views: day.totalViews,
                    isTotal: true
                })
            ).sort((a, b) => {
                if (a.date !== b.date) return a.date.localeCompare(b.date);
                if (a.isTotal) return 1;
                if (b.isTotal) return -1;
                return a.url.localeCompare(b.url);
            });
        }

        function getDistinctColor(index, total) {
            return `hsl(${(index * 360 / total) % 360}, 70%, 50%)`;
        }

        function getChartData() {
            if (!Array.isArray(vm.pageViews) || vm.pageViews.length === 0) {
                return { labels: [], datasets: [] };
            }

            var groupedData = {};
            var pageUrls = new Set();

            vm.pageViews.forEach(function (view) {
                var date = $filter('date')(view.timestamp, 'yyyy-MM-dd');
                if (!groupedData[date]) {
                    groupedData[date] = {};
                }
                if (!groupedData[date][view.url]) {
                    groupedData[date][view.url] = 0;
                }
                groupedData[date][view.url]++;
                pageUrls.add(view.url);
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

        function createChart() {
            var ctx = document.getElementById('pageViewsChart');
            if (!ctx) {
                return;
            }
            var chartData = vm.getChartData();

            var maxValue = Math.max(...chartData.datasets.flatMap(dataset => dataset.data));
            maxValue = Math.ceil(maxValue * 1.1);

            if (vm.chart) {
                vm.chart.destroy();
            }

            if (chartData.labels.length === 0) {
                return;
            }

            vm.chart = new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            max: maxValue,
                            type: 'linear',
                            ticks: {
                                stepSize: Math.ceil(maxValue / 10),
                                precision: 0
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    }
                }
            });
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