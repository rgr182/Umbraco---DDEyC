(function () {
    'use strict';

    function analyticsDashboardController($scope, $q, $timeout, $filter, viewAnalyticsResource, notificationsService, dateHelper) {

        const allPages = "All Pages";
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
        vm.showDailyTotalsInTable = true;
        vm.showPerPageOverallTotals = true;
        vm.showAllPagesOverallTotal = true;
        vm.showGraph = true;
        vm.showPerPageViewsInGraph = true;
        vm.uniqueUrls = [];
        vm.selectedUrl = allPages;
        vm.loadPageViews = loadPageViews;
        vm.getChartData = getChartData;
        vm.applyFilters = applyFilters;
        vm.updateChart = updateChart;

        vm.isAllPages = function() {
            return vm.selectedUrl === allPages;
        };
        function formatDateForServer(date) {
            return date ? dateHelper.convertToServerStringTime(moment(date)) : null;
        }

        function getUniqueUrls() {
            vm.uniqueUrls = Array.from(new Set(vm.pageViews.map(view => view.url)));
            vm.uniqueUrls.sort();
            vm.uniqueUrls.unshift(allPages);
            if (!vm.uniqueUrls.includes(vm.selectedUrl)) {
                vm.selectedUrl = allPages;
            }
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
                    getUniqueUrls();
                    applyFilters();
                    return response;
                })
                .catch(function (error) {
                    notificationsService.error("Error", "Failed to load page views: " + (error.message || 'Unknown error'));
                    vm.pageViews = [];
                    vm.groupedPageViews = [];
                    vm.filteredPageViews = [];
                    vm.uniqueUrls = [allPages];
                    vm.selectedUrl = allPages;
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
            var urlTotals = {};

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

                if (!urlTotals[view.url]) {
                    urlTotals[view.url] = 0;
                }
                urlTotals[view.url]++;
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

            Object.entries(urlTotals).forEach(([url, total]) => {
                result.push({
                    date: '',
                    url: 'Overall Total (' + url + ')',
                    views: total,
                    isTotal: true,
                    isOverallTotal: true,
                    isUrlTotal: true
                });
            });

            result.push({
                date: '',
                url: 'Overall Total (All URLs)',
                views: overallTotal,
                isTotal: true,
                isOverallTotal: true,
                isAllUrlsTotal: true
            });

            return result.sort((a, b) => {
                if (a.date !== b.date) return a.date.localeCompare(b.date);
                if (a.isTotal) return 1;
                if (b.isTotal) return -1;
                return a.url.localeCompare(b.url);
            });
        }

        function applyFilters() {
            const isAllPages = vm.isAllPages();
            if (!isAllPages) {
                vm.showPerPageViewsInGraph = true;
            }
            vm.filteredPageViews = (vm.groupedPageViews || []).filter(function(view) {
                var urlMatch = isAllPages || view.url === vm.selectedUrl || 
                               (view.isUrlTotal && view.url === 'Overall Total (' + vm.selectedUrl + ')') ||
                               (vm.selectedUrl !== allPages && view.isAllUrlsTotal);
                
                var showView = (vm.showPerPageViewsInTable && view.isPerPage && !view.isTotal) ||
                               (vm.showDailyTotalsInTable && view.isDailyTotal) ||
                               (vm.showPerPageOverallTotals && view.isUrlTotal) ||
                               (vm.showAllPagesOverallTotal && view.isAllUrlsTotal);
                
                return urlMatch && showView;
            });

            // Add importance flags for styling
            vm.filteredPageViews.forEach(function(view) {
                view.isImportant = view.isDailyTotal || view.isUrlTotal || view.isAllUrlsTotal;
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
                    (!vm.showPerPageViewsInGraph && view.isDailyTotal)) {
                    if (vm.selectedUrl === allPages || view.url === vm.selectedUrl) {
                        if (!groupedData[view.date]) {
                            groupedData[view.date] = {};
                        }
                        var key = vm.showPerPageViewsInGraph ? view.url : 'Total';
                        if (!groupedData[view.date][key]) {
                            groupedData[view.date][key] = 0;
                        }
                        groupedData[view.date][key] += view.views;
                        pageUrls.add(key);
                    }
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
                    backgroundColor: vm.showPerPageViewsInGraph ? 
                        getDistinctColor(index, urlArray.length) : 
                        'rgba(75, 192, 192, 0.6)',
                    borderColor: vm.showPerPageViewsInGraph ? 
                        getDistinctColor(index, urlArray.length) : 
                        'rgba(75, 192, 192, 1)',
                    borderWidth: 1
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

            if (!vm.showGraph) {
                if (vm.chart) {
                    vm.chart.destroy();
                    vm.chart = null;
                }
                return;
            }

            var chartData = vm.getChartData();

            var chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: vm.showPerPageViewsInGraph,
                    },
                    y: {
                        stacked: vm.showPerPageViewsInGraph,
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        mode: vm.showPerPageViewsInGraph ? 'index' : 'point',
                        intersect: false,
                        callbacks: {
                            title: function(tooltipItems) {
                                return tooltipItems[0].label;
                            },
                            label: function(context) {
                                var label = vm.showPerPageViewsInGraph ? context.dataset.label : 'Total Views';
                                label += ': ' + context.parsed.y;
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
            vm.selectedUrl = allPages;
            loadPageViews();
        }

        $timeout(init, 0);
    }

    angular.module('umbraco').controller('AnalyticsDashboardController', ['$scope', '$q', '$timeout', '$filter', 'viewAnalyticsResource', 'notificationsService', 'dateHelper', analyticsDashboardController]);
})();