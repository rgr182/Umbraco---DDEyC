(function () {
    'use strict';

    function analyticsDashboardController($scope, $timeout, viewAnalyticsResource, notificationsService, dateHelper) {
        var vm = this;
        vm.pageViews = [];
        vm.groupedPageViews = [];
        vm.loading = false;
        vm.dateFilter = {
            startDate: dateHelper.convertToServerStringTime(moment().subtract(30, 'days')),
            endDate: dateHelper.convertToServerStringTime(moment())
        };

        vm.loadPageViews = loadPageViews;
        vm.getChartData = getChartData;
        vm.updateStartDate = updateStartDate;
        vm.updateEndDate = updateEndDate;

        function updateStartDate(date) {
            vm.dateFilter.startDate = date;
        }

        function updateEndDate(date) {
            vm.dateFilter.endDate = date;
        }

        function loadPageViews() {
            console.log('loadPageViews called');
            vm.loading = true;
            viewAnalyticsResource.getPageViewsByDateRange(vm.dateFilter.startDate, vm.dateFilter.endDate)
                .then(function (response) {
                    console.log('API response:', response);
                    vm.pageViews = response.data;
                    vm.groupedPageViews = groupPageViews(vm.pageViews);
                    vm.loading = false;
                    $timeout(createChart, 0);
                }, function (error) {
                    console.error('API error:', error);
                    notificationsService.error("Error", "Failed to load page views");
                    vm.loading = false;
                });
        }

        function groupPageViews(pageViews) {
            var grouped = {};
            pageViews.forEach(function(view) {
                var date = moment(view.timestamp).format('YYYY-MM-DD');
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
            console.log('getChartData called');
            var groupedData = {};
            var pageUrls = new Set();

            vm.pageViews.forEach(function (view) {
                var date = moment(view.timestamp).format('YYYY-MM-DD');
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
            console.log('createChart called');
            var ctx = document.getElementById('pageViewsChart');
            if (!ctx) {
                console.error('Chart canvas not found');
                return;
            }
            var chartData = vm.getChartData();
            console.log('Chart data:', chartData);

            // Calculate the maximum value
            var maxValue = Math.max(...chartData.datasets.flatMap(dataset => dataset.data));
            maxValue = Math.ceil(maxValue * 1.1); // Add 10% to the max value

            if (vm.chart) {
                vm.chart.destroy();
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

            console.log('Chart created with max value:', maxValue);
        }

        console.log('Controller initialized');
        $timeout(loadPageViews, 0);
    }

    angular.module('umbraco').controller('AnalyticsDashboardController', ['$scope', '$timeout', 'viewAnalyticsResource', 'notificationsService', 'dateHelper', analyticsDashboardController]);
})();