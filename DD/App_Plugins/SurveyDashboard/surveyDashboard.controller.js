(function () {
    'use strict';

    function surveyDashboardController($scope, $http, notificationsService) {
        var vm = this;
        vm.surveys = [];
        vm.selectedSurvey = null;
        vm.surveySummary = null;
        vm.surveyResponses = null;
        vm.selectedResponse = null;
        vm.showDetails = false;
        vm.showSummary = false;
        vm.showResponses = false;
        vm.showResponseDetails = false;

        vm.loadSurveys = loadSurveys;
        vm.viewDetails = viewDetails;
        vm.viewSummary = viewSummary;
        vm.viewResponses = viewResponses;
        vm.viewResponseDetails = viewResponseDetails;
        vm.closeResponseDetails = closeResponseDetails;

        function loadSurveys() {
            $http.get('/api/survey/List')
                .then(function (response) {
                    vm.surveys = response.data;
                })
                .catch(function (error) {
                    notificationsService.error('Error', 'Failed to load surveys');
                });
        }

        function viewDetails(id) {
            $http.get(`/api/survey/${id}`)
                .then(function (response) {
                    vm.selectedSurvey = response.data;
                    vm.showDetails = true;
                    vm.showSummary = false;
                    vm.showResponses = false;
                })
                .catch(function (error) {
                    notificationsService.error('Error', 'Failed to load survey details');
                });
        }

        function viewSummary(id) {
            $http.get(`/api/survey/${id}/summary`)
                .then(function (response) {
                    vm.surveySummary = response.data;
                    vm.showSummary = true;
                    vm.showDetails = false;
                    vm.showResponses = false;
                })
                .catch(function (error) {
                    notificationsService.error('Error', 'Failed to load survey summary');
                });
        }

        function viewResponses(id) {
            $http.get(`/api/survey/${id}/results`)
                .then(function (response) {
                    vm.surveyResponses = response.data;
                    vm.showResponses = true;
                    vm.showDetails = false;
                    vm.showSummary = false;
                })
                .catch(function (error) {
                    notificationsService.error('Error', 'Failed to load survey responses');
                });
        }

        function viewResponseDetails(response) {
            vm.selectedResponse = response;
            vm.showResponseDetails = true;
        }

        function closeResponseDetails() {
            vm.showResponseDetails = false;
            vm.selectedResponse = null;
        }

        loadSurveys();
    }

    angular.module('umbraco').controller('SurveyDashboardController', surveyDashboardController);
})();