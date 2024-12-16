(function () {
    'use strict';
 
    function analyticsDashboardController($scope, eventsService, $timeout, notificationsService) {
        var vm = this;
        
        // Initialize state
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

        // Function to ensure proper iframe and chart container heights
        function setupIframeHeight(iframe) {
            // Set initial height
            iframe.style.height = '800px';
            iframe.style.minHeight = '800px';
            
            // Try to communicate with the iframe content
            iframe.onload = function() {
                $timeout(function() {
                    vm.loading = false;
                    removeLoader();
                    iframe.style.background = 'none';

                    // Send message to iframe content about parent height
                    try {
                        iframe.contentWindow.postMessage({
                            type: 'parentHeight',
                            height: iframe.offsetHeight
                        }, '*');
                    } catch (e) {
                        console.warn('Could not send height to iframe:', e);
                    }
                });
            };
        }
 
        vm.updateDashboard = function() {
            vm.loading = true;
            removeLoader();
            
            var iframe = document.getElementById('analyticsDashboardFrame');
            if (iframe) {
                setupIframeHeight(iframe);
                iframe.src = buildDashboardUrl();
            }
        };
 
        // Initialize
        $timeout(function() {
            var iframe = document.getElementById('analyticsDashboardFrame');
            if (iframe) {
                setupIframeHeight(iframe);
                vm.loading = true;
                iframe.src = buildDashboardUrl();
            }
        });

        // Listen for resize messages from iframe
        window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'requestHeight') {
                var iframe = document.getElementById('analyticsDashboardFrame');
                if (iframe) {
                    event.source.postMessage({
                        type: 'parentHeight',
                        height: iframe.offsetHeight
                    }, '*');
                }
            }
        });

        $scope.$on('$destroy', function() {
            var iframe = document.getElementById('analyticsDashboardFrame');
            if (iframe) {
                iframe.onload = null;
            }
            window.removeEventListener('message', this.messageHandler);
        });
    }
 
    angular
        .module('umbraco')
        .controller('AnalyticsDashboardController', [
            '$scope',
            'eventsService',
            '$timeout',
            'notificationsService',
            analyticsDashboardController
        ]);
})();