(function () {
    'use strict';
 
    function analyticsDashboardController($scope, eventsService, $timeout) {
        var vm = this;
        
        vm.loading = false;
        vm.dateFilter = {
            startDate: moment().subtract(30, 'days').startOf('day').toDate(),
            endDate: moment().endOf('day').toDate()
        };

        function removeLoader() {
            document.querySelectorAll('.umb-loader, .umb-loader-wrapper, .umb-load-indicator')
                .forEach(function(element) { 
                    element.remove(); 
                });
        }
        
        function buildDashboardUrl() {
            var baseUrl = '/umbraco/backoffice/AnalyticsDashboard/Dashboard';
            var params = new URLSearchParams({
                start: moment(vm.dateFilter.startDate).format('YYYY-MM-DD'),
                end: moment(vm.dateFilter.endDate).format('YYYY-MM-DD')
            });
            return baseUrl + '?' + params.toString();
        }

        function setupIframeHeight(iframe) {
            iframe.style.height = '800px';
            iframe.style.minHeight = '800px';
            
            iframe.onload = function() {
                $timeout(function() {
                    vm.loading = false;
                    removeLoader();
                    iframe.style.background = 'none';

                    sendUpdateChartMessage(vm.dateFilter.startDate, vm.dateFilter.endDate);
                });
            };
        }
 
        function sendUpdateChartMessage(startDate, endDate) {
            const iframe = document.getElementById('analyticsDashboardFrame');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'updateChart',
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }, '*');
            }
        }

        vm.updateDashboard = function() {
            vm.loading = true;
            removeLoader();
            
            var iframe = document.getElementById('analyticsDashboardFrame');
            if (iframe) {
                // Reload the iframe to update the @Model based data (tables, counts)
                iframe.src = buildDashboardUrl();
                // Ensure onload handler is re-attached for message sending to chart
                setupIframeHeight(iframe);
            }
        };
 
        // Initial setup on controller load
        $timeout(function() {
            var iframe = document.getElementById('analyticsDashboardFrame');
            if (iframe) {
                setupIframeHeight(iframe);
                vm.loading = true;
                iframe.src = buildDashboardUrl();
            }
        });

        vm.messageHandler = function(event) {
            if (event.data && event.data.type === 'iframeReady') {
                console.log('Iframe reported ready.');
            }
            if (event.data && event.data.type === 'requestHeight') {
                var iframe = document.getElementById('analyticsDashboardFrame');
                if (iframe) {
                    event.source.postMessage({
                        type: 'parentHeight',
                        height: iframe.offsetHeight
                    }, '*');
                }
            }
        };

        window.addEventListener('message', vm.messageHandler);

        $scope.$on('$destroy', function() {
            var iframe = document.getElementById('analyticsDashboardFrame');
            if (iframe) {
                iframe.onload = null;
            }
            window.removeEventListener('message', vm.messageHandler);
        });
    }
 
    angular
        .module('umbraco')
        .controller('AnalyticsDashboardController', [
            '$scope',
            'eventsService',
            '$timeout',
            'notificationsService', // Ensure notificationsService is injected if used elsewhere
            analyticsDashboardController
        ]);
})();