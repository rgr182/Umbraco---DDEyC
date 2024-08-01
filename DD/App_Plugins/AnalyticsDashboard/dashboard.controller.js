(function () {
    'use strict';

    function analyticsDashboardController($scope, $q, $timeout, $filter, viewAnalyticsResource, notificationsService, dateHelper) {
        var vm = this;
        vm.pageViews = [];
        vm.filteredPageViews = [];
        vm.groupedPageViews = [];
        vm.loading = false;
        vm.dateFilter = {
            startDate: moment().subtract(30, 'days').toDate(),
            endDate: new Date()
        };
        vm.urlFilter = '';
        vm.showPerPageViewsInTable = true;
        vm.showDailyTotalsInTable = true;
        vm.showPerPageOverallTotals = true;
        vm.showAllPagesOverallTotal = true;
        vm.showGraph = true;
        vm.showPerPageViewsInGraph = true;
        vm.uniqueUrls = [];
        vm.selectedUrl = 'All Pages';

        vm.loadPageViews = loadPageViews;
        vm.getChartData = getChartData;
        vm.applyFilters = applyFilters;
        vm.updateChart = _.debounce(updateChart, 250);
        vm.isAllPages = isAllPages;

        function isAllPages() {
            return vm.selectedUrl === 'All Pages';
        }

        function loadPageViews() {
            if (!validateDateRange()) return $q.reject("Invalid date range");
            
            vm.loading = true;
            var startDate = getStartOfDay(vm.dateFilter.startDate);
            var endDate = getEndOfDay(vm.dateFilter.endDate);
            
            return viewAnalyticsResource.getPageViewsByDateRange(startDate, endDate)
                .then(handlePageViewsResponse)
                .catch(handlePageViewsError)
                .finally(() => {
                    vm.loading = false;
                    $timeout(vm.updateChart, 0);
                });
        }
        function getStartOfDay(date) {
            return moment(date).startOf('day').toISOString();
        }

        function getEndOfDay(date) {
            return moment(date).endOf('day').toISOString();
        }
        function validateDateRange() {
            if (!vm.dateFilter.startDate || !vm.dateFilter.endDate) {
                notificationsService.warning("Warning", "Please select both start and end dates.");
                return false;
            }
            return true;
        }

        function formatDateForServer(date) {
            return date ? dateHelper.convertToServerStringTime(moment(date)) : null;
        }

        function handlePageViewsResponse(response) {
            vm.pageViews = response.data.map(view => ({
                ...view,
                timestamp: moment.utc(view.timestamp).local().toDate()
            }));
            vm.groupedPageViews = groupPageViews(vm.pageViews);
            getUniqueUrls();
            applyFilters();
            return response;
        }

        function handlePageViewsError(error) {
            notificationsService.error("Error", "Failed to load page views: " + (error.message || 'Unknown error'));
            resetViewData();
            return $q.reject(error);
        }

        function resetViewData() {
            vm.pageViews = [];
            vm.groupedPageViews = [];
            vm.filteredPageViews = [];
            vm.uniqueUrls = ['All Pages'];
            vm.selectedUrl = 'All Pages';
        }

        function getUniqueUrls() {
            vm.uniqueUrls = ['All Pages', ...new Set(vm.pageViews.map(view => view.url))].sort();
            if (!vm.uniqueUrls.includes(vm.selectedUrl)) {
                vm.selectedUrl = 'All Pages';
            }
        }

        function groupPageViews(pageViews) {
            if (!Array.isArray(pageViews) || pageViews.length === 0) return [];

            const grouped = pageViews.reduce((acc, view) => {
                const date = moment(view.timestamp).format('YYYY-MM-DD');
                if (!acc[date]) {
                    acc[date] = { date, urls: {}, totalViews: 0 };
                }
                acc[date].urls[view.url] = (acc[date].urls[view.url] || 0) + 1;
                acc[date].totalViews++;
                return acc;
            }, {});

            const urlTotals = pageViews.reduce((acc, view) => {
                acc[view.url] = (acc[view.url] || 0) + 1;
                return acc;
            }, {});

            const overallTotal = pageViews.length;

            return [
                ...Object.entries(grouped).flatMap(([date, day]) => [
                    ...Object.entries(day.urls).map(([url, views]) => ({
                        date,
                        url,
                        views,
                        isPerPage: true,
                        isTotal: false
                    })),
                    {
                        date,
                        url: `Total (${date})`,
                        views: day.totalViews,
                        isDailyTotal: true,
                        isTotal: true
                    }
                ]),
                ...Object.entries(urlTotals).map(([url, total]) => ({
                    date: '',
                    url: `Overall Total (${url})`,
                    views: total,
                    isUrlTotal: true,
                    isOverallTotal: true,
                    isTotal: true
                })),
                {
                    date: '',
                    url: 'Overall Total (All URLs)',
                    views: overallTotal,
                    isAllUrlsTotal: true,
                    isOverallTotal: true,
                    isTotal: true
                }
            ].sort((a, b) => a.date.localeCompare(b.date) || (a.isTotal ? 1 : -1) || a.url.localeCompare(b.url));
        }

        function applyFilters() {
            const isAllPagesSelected = isAllPages();
            if (!isAllPagesSelected) {
                vm.showPerPageViewsInGraph = true;
            }
            vm.filteredPageViews = vm.groupedPageViews.filter(view => 
                (isAllPagesSelected || view.url === vm.selectedUrl || 
                 (view.isUrlTotal && view.url === `Overall Total (${vm.selectedUrl})`) ||
                 (!isAllPagesSelected && view.isAllUrlsTotal)) &&
                ((vm.showPerPageViewsInTable && view.isPerPage && !view.isTotal) ||
                 (vm.showDailyTotalsInTable && view.isDailyTotal) ||
                 (vm.showPerPageOverallTotals && view.isUrlTotal) ||
                 (vm.showAllPagesOverallTotal && view.isAllUrlsTotal))
            );

            vm.filteredPageViews.forEach(view => {
                view.isImportant = view.isDailyTotal || view.isUrlTotal || view.isAllUrlsTotal;
            });

            vm.updateChart();
        }

        function getChartData() {
            if (!Array.isArray(vm.groupedPageViews) || vm.groupedPageViews.length === 0) {
                return { labels: [], datasets: [] };
            }

            const groupedData = vm.groupedPageViews.reduce((acc, view) => {
                if ((vm.showPerPageViewsInGraph && view.isPerPage) || 
                    (!vm.showPerPageViewsInGraph && view.isDailyTotal)) {
                    if (isAllPages() || view.url === vm.selectedUrl) {
                        if (!acc[view.date]) acc[view.date] = {};
                        const key = vm.showPerPageViewsInGraph ? view.url : 'Total';
                        acc[view.date][key] = (acc[view.date][key] || 0) + view.views;
                    }
                }
                return acc;
            }, {});

            const sortedDates = Object.keys(groupedData).sort();
            const pageUrls = new Set(Object.values(groupedData).flatMap(Object.keys));

            return {
                labels: sortedDates,
                datasets: Array.from(pageUrls).map((url, index) => ({
                    label: url,
                    data: sortedDates.map(date => groupedData[date][url] || 0),
                    backgroundColor: getDistinctColor(index, pageUrls.size),
                    borderColor: getDistinctColor(index, pageUrls.size),
                    borderWidth: 1
                }))
            };
        }

        function getDistinctColor(index, total) {
            return `hsl(${(index * 360 / total) % 360}, 70%, 50%)`;
        }

        function updateChart() {
            const ctx = document.getElementById('pageViewsChart');
            if (!ctx) return;

            if (!vm.showGraph) {
                if (vm.chart) {
                    vm.chart.destroy();
                    vm.chart = null;
                }
                return;
            }

            const chartData = vm.getChartData();
            const chartOptions = getChartOptions();

            try {
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
            } catch (error) {
                notificationsService.error("Chart Error", "Failed to update chart: " + error.message);
            }
        }

        function getChartOptions() {
            return {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { stacked: vm.showPerPageViewsInGraph },
                    y: {
                        stacked: vm.showPerPageViewsInGraph,
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: vm.showPerPageViewsInGraph ? 'index' : 'point',
                        intersect: false,
                        callbacks: {
                            title: tooltipItems => tooltipItems[0].label,
                            label: context => {
                                const label = vm.showPerPageViewsInGraph ? context.dataset.label : 'Total Views';
                                return `${label}: ${context.parsed.y}`;
                            }
                        }
                    }
                }
            };
        }

        $timeout(loadPageViews, 0);
    }

    angular.module('umbraco').controller('AnalyticsDashboardController', ['$scope', '$q', '$timeout', '$filter', 'viewAnalyticsResource', 'notificationsService', 'dateHelper', analyticsDashboardController]);
})();