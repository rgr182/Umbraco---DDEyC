(function () {
    'use strict';

    let currentChart = null;
    let aggregatedData = null;
    let rawDataCache = null;

    function aggregateDataByPeriod(dailyData, totalPoints = 50) {
        if (dailyData.length <= totalPoints) return dailyData;

        const groupSize = Math.ceil(dailyData.length / totalPoints);
        const aggregated = [];
        
        for (let i = 0; i < dailyData.length; i += groupSize) {
            const chunk = dailyData.slice(i, i + groupSize);
            const aggregatedPoint = {
                date: chunk[0].date,
                pageViews: {},
                dailyTotal: 0
            };

            // Get all unique URLs from this chunk
            const urls = new Set();
            chunk.forEach(day => {
                Object.keys(day.pageViews).forEach(url => urls.add(url));
            });

            // Calculate averages for each URL
            urls.forEach(url => {
                const sum = chunk.reduce((acc, day) => acc + (day.pageViews[url] || 0), 0);
                aggregatedPoint.pageViews[url] = Math.round(sum / chunk.length);
            });

            // Calculate average daily total
            aggregatedPoint.dailyTotal = Math.round(
                chunk.reduce((acc, day) => acc + day.dailyTotal, 0) / chunk.length
            );

            aggregated.push(aggregatedPoint);
        }

        return aggregated;
    }

    function initializeChart(rawData) {
        const canvas = document.getElementById('pageViewsChart');
        const ctx = canvas.getContext('2d');

        if (currentChart) {
            currentChart.destroy();
        }

        // Clean and parse the data
        const cleanData = rawData.replace(/^\)\]\}',/, '');
        rawDataCache = JSON.parse(cleanData);

        // Aggregate data based on screen width
        const containerWidth = canvas.parentElement.offsetWidth;
        const optimalPoints = Math.min(Math.floor(containerWidth / 20), 50); // 20px per point, max 50 points
        aggregatedData = aggregateDataByPeriod(rawDataCache, optimalPoints);

        // Create datasets
        const urls = [...new Set(aggregatedData.flatMap(day => Object.keys(day.pageViews)))];
        const datasets = urls.map((url, index) => ({
            label: url,
            data: aggregatedData.map(day => day.pageViews[url] || 0),
            backgroundColor: `hsl(${(index * 360 / urls.length) % 360}, 70%, 50%, 0.2)`,
            borderColor: `hsl(${(index * 360 / urls.length) % 360}, 70%, 50%)`,
            borderWidth: 1,
            order: 2
        }));

        datasets.push({
            label: 'Total Views (Average)',
            data: aggregatedData.map(day => day.dailyTotal),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            type: 'line',
            order: 1
        });

        currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: aggregatedData.map(d => moment(d.date).format('YYYY-MM-DD')),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false, // Disable animations for better performance
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    }
                },
                plugins: {
                    legend: {
                        display: false // Hide legend for better performance
                    },
                    tooltip: {
                        mode: null,
                        intersect: false,
                    }
                }
            }
        });

        return currentChart;
    }

    // Debounced resize handler
    let resizeTimeout;
    function handleResize() {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        
        resizeTimeout = setTimeout(() => {
            if (rawDataCache && currentChart) {
                initializeChart(JSON.stringify(rawDataCache));
            }
        }, 250); // Longer delay for resize
    }

    window.addEventListener('resize', handleResize);

    // Export functions
    window.AnalyticsDashboard = {
        initializeChart: initializeChart,
        handleResize: handleResize
    };
})();