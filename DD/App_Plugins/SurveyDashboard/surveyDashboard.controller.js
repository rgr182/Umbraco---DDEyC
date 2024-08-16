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

        // Pagination
        vm.currentPage = 1;
        vm.pageSize = 10;
        vm.totalItems = 0;
        vm.totalPages = 1;

        // Search and filter
        vm.searchQuery = '';
        vm.dateFrom = null;
        vm.dateTo = null;

        vm.loadSurveys = loadSurveys;
        vm.viewDetails = viewDetails;
        vm.viewSummary = viewSummary;
        vm.viewResponses = viewResponses;
        vm.viewResponseDetails = viewResponseDetails;
        vm.closeResponseDetails = closeResponseDetails;
        vm.searchAndFilter = searchAndFilter;
        vm.changePage = changePage;

        function loadSurveys() {
            var params = {
                page: vm.currentPage,
                pageSize: vm.pageSize,
                searchQuery: vm.searchQuery,
                fromDate: vm.dateFrom ? vm.dateFrom.toISOString() : null,
                toDate: vm.dateTo ? vm.dateTo.toISOString() : null
            };

            $http.get('/umbraco/backoffice/DDEyC/Survey/GetSurveyList', { params: params })
                .then(function (response) {
                    console.log('Raw response:', response);  // Log the raw response
                    var data = response.data;
                    
                    // Handle Umbraco's JSON wrapping
                    if (typeof data === 'string') {
                        var match = data.match(/\{.*\}/);
                        if (match) {
                            try {
                                data = JSON.parse(match[0]);
                            } catch (e) {
                                console.error('Error parsing JSON:', e);
                                notificationsService.error('Error', 'Failed to parse survey data');
                                return;
                            }
                        } else {
                            console.error('Unable to extract JSON from response');
                            notificationsService.error('Error', 'Invalid data format received');
                            return;
                        }
                    }

                    // Check if the data has the expected structure
                    if (data && Array.isArray(data.Items)) {
                        vm.surveys = data.Items.map(function(survey) {
                            return {
                                id: survey.Id,
                                name: survey.Name,
                                createdAt: new Date(survey.CreatedAt),
                                questionCount: survey.QuestionCount,
                                responseCount: survey.ResponseCount
                            };
                        });
                        vm.totalItems = data.TotalItems;
                        vm.totalPages = Math.ceil(vm.totalItems / vm.pageSize);
                    } else {
                        console.error('Unexpected data structure:', data);
                        notificationsService.error('Error', 'Received unexpected data structure');
                    }
                })
                .catch(function (error) {
                    console.error('Error loading surveys:', error);
                    notificationsService.error('Error', 'Failed to load surveys');
                });
        }

        function searchAndFilter() {
            vm.currentPage = 1;
            loadSurveys();
        }

        function changePage(newPage) {
            if (newPage >= 1 && newPage <= vm.totalPages) {
                vm.currentPage = newPage;
                loadSurveys();
            }
        }

        function viewDetails(id) {
            $http.get(`/umbraco/backoffice/DDEyC/Survey/details/${id}`)
                .then(function (response) {
                    vm.selectedSurvey = {
                        id: response.data.Id,
                        name: response.data.Name,
                        createdAt: new Date(response.data.CreatedAt),
                        questions: response.data.Questions,
                        responseCount: response.data.ResponseCount
                    };
                    vm.showDetails = true;
                    vm.showSummary = false;
                    vm.showResponses = false;
                })
                .catch(function (error) {
                    console.error('Error loading survey details:', error);
                    notificationsService.error('Error', 'Failed to load survey details');
                });
        }

        function viewSummary(id) {
            $http.get(`/umbraco/backoffice/DDEyC/Survey/summary/${id}`)
                .then(function (response) {
                    vm.surveySummary = {
                        id: response.data.Id,
                        name: response.data.Name,
                        createdAt: new Date(response.data.CreatedAt),
                        totalResponses: response.data.TotalResponses,
                        questionSummaries: response.data.QuestionSummaries.map(function(qs) {
                            return {
                                questionText: qs.QuestionText,
                                answerCount: qs.AnswerCount,
                                uniqueAnswers: qs.UniqueAnswers,
                                topAnswers: qs.TopAnswers.map(function(ta) {
                                    return {
                                        answerText: ta.AnswerText,
                                        frequency: ta.Frequency
                                    };
                                })
                            };
                        })
                    };
                    vm.showSummary = true;
                    vm.showDetails = false;
                    vm.showResponses = false;
                })
                .catch(function (error) {
                    console.error('Error loading survey summary:', error);
                    notificationsService.error('Error', 'Failed to load survey summary');
                });
        }

        function viewResponses(id) {
            $http.get(`/umbraco/backoffice/DDEyC/Survey/results/${id}`)
                .then(function (response) {
                    vm.surveyResponses = response.data.map(function(result) {
                        return {
                            id: result.Id,
                            name: result.Name,
                            email: result.Email,
                            phone: result.Phone,
                            submittedAt: new Date(result.SubmittedAt),
                            answers: result.Answers.map(function(answer) {
                                return {
                                    questionText: answer.QuestionText,
                                    answerText: answer.AnswerText
                                };
                            })
                        };
                    });
                    vm.showResponses = true;
                    vm.showDetails = false;
                    vm.showSummary = false;
                })
                .catch(function (error) {
                    console.error('Error loading survey responses:', error);
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

        // Initialize
        loadSurveys();
    }

    angular.module('umbraco').controller('SurveyDashboardController', ['$scope', '$http', 'notificationsService', surveyDashboardController]);
})();