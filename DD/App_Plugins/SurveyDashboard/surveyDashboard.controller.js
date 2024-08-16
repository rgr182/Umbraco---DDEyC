(function () {
    'use strict';

    function surveyDashboardController($scope, $http, notificationsService, $timeout, $location, $anchorScroll) {
        const vm = this;
        const memoryCache = {};
        const MAX_CACHE_SIZE = 100;
        const SURVEY_LIST_CACHE_TIME = 60000; // 1 minute
        const SURVEY_DETAILS_CACHE_TIME = 300000; // 5 minutes

        // Initialize properties
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

        // Method assignments
        vm.loadSurveys = loadSurveys;
        vm.viewDetails = viewDetails;
        vm.viewSummary = viewSummary;
        vm.viewResponses = viewResponses;
        vm.viewResponseDetails = viewResponseDetails;
        vm.closeResponseDetails = closeResponseDetails;
        vm.searchAndFilter = searchAndFilter;
        vm.changePage = changePage;
        vm.scrollTo = scrollTo;
        vm.clearCache = clearCache;

        // Function definitions
        function addToCache(key, data, expirationTime) {
            if (Object.keys(memoryCache).length >= MAX_CACHE_SIZE) {
                const oldestKey = Object.keys(memoryCache).reduce((a, b) => 
                    memoryCache[a].timestamp < memoryCache[b].timestamp ? a : b
                );
                delete memoryCache[oldestKey];
            }
            memoryCache[key] = {
                data: data,
                timestamp: new Date().getTime(),
                expirationTime: expirationTime
            };
        }

        function getFromCache(key) {
            const cachedItem = memoryCache[key];
            if (cachedItem && (new Date().getTime() - cachedItem.timestamp < cachedItem.expirationTime)) {
                return cachedItem.data;
            }
            return null;
        }

        function clearCache() {
            Object.keys(memoryCache).forEach(key => delete memoryCache[key]);
            notificationsService.success("Cache Cleared", "The cache has been successfully cleared.");
            loadSurveys();
        }

        function loadSurveys() {
            const params = {
                page: vm.currentPage,
                pageSize: vm.pageSize,
                searchQuery: vm.searchQuery,
                fromDate: vm.dateFrom ? vm.dateFrom.toISOString() : null,
                toDate: vm.dateTo ? vm.dateTo.toISOString() : null
            };

            const cacheKey = 'surveys_' + JSON.stringify(params);
            const cachedData = getFromCache(cacheKey);

            if (cachedData) {
                processSurveyData(cachedData);
            } else {
                $http.get('/umbraco/backoffice/DDEyC/Survey/GetSurveyList', { params: params })
                    .then(function (response) {
                        let data = response.data;
                        if (typeof data === 'string') {
                            const match = data.match(/\{.*\}/);
                            if (match) {
                                try {
                                    data = JSON.parse(match[0]);
                                } catch (e) {
                                    notificationsService.error('Error', 'Failed to parse survey data');
                                    return;
                                }
                            } else {
                                notificationsService.error('Error', 'Invalid data format received');
                                return;
                            }
                        }
                        addToCache(cacheKey, data, SURVEY_LIST_CACHE_TIME);
                        processSurveyData(data);
                    })
                    .catch(function (error) {
                        notificationsService.error('Error', 'Failed to load surveys');
                    });
            }
        }

        function processSurveyData(data) {
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
                vm.currentPage = data.Page;
            } else {
                notificationsService.error('Error', 'Received unexpected data structure');
            }
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

        function scrollTo(elementId) {
            $timeout(function() {
                const element = document.getElementById(elementId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }

        function viewDetails(id) {
            const cacheKey = 'survey_details_' + id;
            const cachedData = getFromCache(cacheKey);

            if (cachedData) {
                processSurveyDetails(cachedData);
            } else {
                $http.get(`/umbraco/backoffice/DDEyC/Survey/details/${id}`)
                    .then(function (response) {
                        addToCache(cacheKey, response.data, SURVEY_DETAILS_CACHE_TIME);
                        processSurveyDetails(response.data);
                    })
                    .catch(function (error) {
                        notificationsService.error('Error', 'Failed to load survey details');
                    });
            }
        }

        function processSurveyDetails(data) {
            vm.selectedSurvey = {
                id: data.Id,
                name: data.Name,
                createdAt: new Date(data.CreatedAt),
                questions: data.Questions,
                responseCount: data.ResponseCount
            };
            vm.showDetails = true;
            vm.showSummary = false;
            vm.showResponses = false;
            scrollTo('surveyDetails');
        }

        function viewSummary(id) {
            const cacheKey = 'survey_summary_' + id;
            const cachedData = getFromCache(cacheKey);

            if (cachedData) {
                processSurveySummary(cachedData);
            } else {
                $http.get(`/umbraco/backoffice/DDEyC/Survey/summary/${id}`)
                    .then(function (response) {
                        addToCache(cacheKey, response.data, SURVEY_DETAILS_CACHE_TIME);
                        processSurveySummary(response.data);
                    })
                    .catch(function (error) {
                        notificationsService.error('Error', 'Failed to load survey summary');
                    });
            }
        }

        function processSurveySummary(data) {
            vm.surveySummary = {
                id: data.Id,
                name: data.Name,
                createdAt: new Date(data.CreatedAt),
                totalResponses: data.TotalResponses,
                questionSummaries: data.QuestionSummaries.map(function(qs) {
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
            scrollTo('surveySummary');
        }

        function viewResponses(id) {
            const cacheKey = 'survey_responses_' + id;
            const cachedData = getFromCache(cacheKey);

            if (cachedData) {
                processSurveyResponses(cachedData);
            } else {
                $http.get(`/umbraco/backoffice/DDEyC/Survey/results/${id}`)
                    .then(function (response) {
                        addToCache(cacheKey, response.data, SURVEY_DETAILS_CACHE_TIME);
                        processSurveyResponses(response.data);
                    })
                    .catch(function (error) {
                        notificationsService.error('Error', 'Failed to load survey responses');
                    });
            }
        }

        function processSurveyResponses(data) {
            vm.surveyResponses = data.map(function(result) {
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
            scrollTo('surveyResponses');
        }

        function viewResponseDetails(response) {
            vm.selectedResponse = response;
            vm.showResponseDetails = true;
            scrollTo('responseDetails');
        }

        function closeResponseDetails() {
            vm.showResponseDetails = false;
            vm.selectedResponse = null;
            scrollTo('surveyResponses');
        }

        // Initialize
        loadSurveys();
    }

    angular.module('umbraco').controller('SurveyDashboardController', [
        '$scope', 
        '$http', 
        'notificationsService', 
        '$timeout', 
        '$location', 
        '$anchorScroll',
        surveyDashboardController
    ]);
})();