(function () {
    'use strict';

    function viewAnalyticsResource($http) {
        var resource = {
            getPageViewsByDateRange: getPageViewsByDateRange
        };

        return resource;

        function getPageViewsByDateRange(startDate, endDate) {
            console.log('Calling API with dates:', startDate, endDate);
            return $http.get("/umbraco/api/ViewAnalytics/GetPageViewsByDateRange", {
                params: { start: startDate, end: endDate }
            });
        }
    }

    angular.module('umbraco.resources').factory('viewAnalyticsResource', viewAnalyticsResource);
})();