(function () {
    'use strict';

    function viewAnalyticsResource($http, notificationsService) {
        var resource = {
            getPageViewsByDateRange: getPageViewsByDateRange,
            getAllPageViews: getAllPageViews
        };

        return resource;

        function getPageViewsByDateRange(startDate, endDate) {
            return $http.get("/umbraco/backoffice/api/ViewAnalytics/GetPageViewsByDateRange", {
                params: { start: startDate, end: endDate }
            }).catch(handleError);
        }

        function getAllPageViews() {
            return $http.get("/umbraco/backoffice/api/ViewAnalytics/GetAllPageViews")
                .catch(handleError);
        }

        function handleError(error) {
            if (error.status === 401) {
                notificationsService.error("Unauthorized", "You do not have permission to access this data.");
            } else {
                notificationsService.error("Error", "An error occurred while fetching analytics data.");
            }
            return Promise.reject(error);
        }
    }

    angular.module('umbraco.resources').factory('viewAnalyticsResource', ['$http', 'notificationsService', viewAnalyticsResource]);
})();