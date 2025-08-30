/**
 * HealthCare AI - Charts Implementation
 * Handles Chart.js visualizations for health data
 */

// Chart.js default configuration
Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
Chart.defaults.color = '#6c757d';
Chart.defaults.borderColor = '#dee2e6';

// Global chart instances
let lifestyleChart = null;
let weeklyProgressChart = null;

/**
 * Load lifestyle chart data and create visualization
 */
async function loadLifestyleChart() {
    try {
        const response = await fetch('/api/lifestyle_chart_data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            console.error('API Error:', data.error);
            showChartError('lifestyleChart', 'Unable to load chart data');
            return;
        }
        
        createLifestyleChart(data);
        
    } catch (error) {
        console.error('Error loading lifestyle chart:', error);
        showChartError('lifestyleChart', 'Failed to load chart data');
    }
}

/**
 * Create the main lifestyle chart
 */
function createLifestyleChart(data) {
    const ctx = document.getElementById('lifestyleChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (lifestyleChart) {
        lifestyleChart.destroy();
    }
    
    // Prepare data
    const chartData = {
        labels: data.labels.length > 0 ? data.labels : ['No data available'],
        datasets: [
            {
                label: 'Sleep Hours',
                data: data.sleep_data.length > 0 ? data.sleep_data : [0],
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(13, 110, 253, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            },
            {
                label: 'Exercise Minutes',
                data: data.exercise_data.length > 0 ? data.exercise_data : [0],
                backgroundColor: 'rgba(25, 135, 84, 0.1)',
                borderColor: 'rgba(25, 135, 84, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(25, 135, 84, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            },
            {
                label: 'Water Glasses',
                data: data.water_data.length > 0 ? data.water_data : [0],
                backgroundColor: 'rgba(13, 202, 240, 0.1)',
                borderColor: 'rgba(13, 202, 240, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(13, 202, 240, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }
        ]
    };
    
    const config = {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#dee2e6',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            return context[0].label || 'Date';
                        },
                        label: function(context) {
                            const label = context.dataset.label;
                            const value = context.parsed.y;
                            
                            if (label === 'Sleep Hours') {
                                return `${label}: ${value}h`;
                            } else if (label === 'Exercise Minutes') {
                                return `${label}: ${value} min`;
                            } else if (label === 'Water Glasses') {
                                return `${label}: ${value} glasses`;
                            }
                            return `${label}: ${value}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Value',
                        font: {
                            weight: 'bold'
                        }
                    },
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            elements: {
                point: {
                    hoverBorderWidth: 3
                }
            }
        }
    };
    
    lifestyleChart = new Chart(ctx, config);
}

/**
 * Load weekly progress chart for lifestyle log page
 */
async function loadWeeklyProgressChart() {
    try {
        const response = await fetch('/api/lifestyle_chart_data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            console.error('API Error:', data.error);
            showChartError('weeklyProgressChart', 'Unable to load chart data');
            return;
        }
        
        createWeeklyProgressChart(data);
        
    } catch (error) {
        console.error('Error loading weekly progress chart:', error);
        showChartError('weeklyProgressChart', 'Failed to load chart data');
    }
}

/**
 * Create weekly progress chart with bar visualization
 */
function createWeeklyProgressChart(data) {
    const ctx = document.getElementById('weeklyProgressChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (weeklyProgressChart) {
        weeklyProgressChart.destroy();
    }
    
    // Prepare data for bar chart
    const chartData = {
        labels: data.labels.length > 0 ? data.labels : ['No data'],
        datasets: [
            {
                label: 'Sleep Hours',
                data: data.sleep_data.length > 0 ? data.sleep_data : [0],
                backgroundColor: 'rgba(13, 110, 253, 0.7)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false
            },
            {
                label: 'Exercise (in 10-min units)',
                data: data.exercise_data.length > 0 ? data.exercise_data.map(val => val / 10) : [0],
                backgroundColor: 'rgba(25, 135, 84, 0.7)',
                borderColor: 'rgba(25, 135, 84, 1)',
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false
            },
            {
                label: 'Water Glasses',
                data: data.water_data.length > 0 ? data.water_data : [0],
                backgroundColor: 'rgba(13, 202, 240, 0.7)',
                borderColor: 'rgba(13, 202, 240, 1)',
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false
            }
        ]
    };
    
    const config = {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#dee2e6',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            return context[0].label || 'Date';
                        },
                        label: function(context) {
                            const label = context.dataset.label;
                            const value = context.parsed.y;
                            
                            if (label === 'Sleep Hours') {
                                return `${label}: ${value}h`;
                            } else if (label === 'Exercise (in 10-min units)') {
                                return `Exercise: ${value * 10} minutes`;
                            } else if (label === 'Water Glasses') {
                                return `${label}: ${value} glasses`;
                            }
                            return `${label}: ${value}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Value',
                        font: {
                            weight: 'bold'
                        }
                    },
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    };
    
    weeklyProgressChart = new Chart(ctx, config);
}

/**
 * Create a simple doughnut chart for health summary
 */
function createHealthSummaryChart(elementId, data) {
    const ctx = document.getElementById(elementId);
    if (!ctx) return;
    
    const chartData = {
        labels: data.labels || ['Good', 'Needs Improvement'],
        datasets: [{
            data: data.values || [70, 30],
            backgroundColor: [
                'rgba(25, 135, 84, 0.8)',
                'rgba(255, 193, 7, 0.8)',
                'rgba(220, 53, 69, 0.8)'
            ],
            borderColor: [
                'rgba(25, 135, 84, 1)',
                'rgba(255, 193, 7, 1)',
                'rgba(220, 53, 69, 1)'
            ],
            borderWidth: 2
        }]
    };
    
    const config = {
        type: 'doughnut',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((context.parsed / total) * 100);
                            return `${context.label}: ${percentage}%`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    };
    
    return new Chart(ctx, config);
}

/**
 * Show error message when chart fails to load
 */
function showChartError(canvasId, message) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const container = canvas.parentElement;
    container.innerHTML = `
        <div class="text-center py-5">
            <i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
            <h6 class="text-muted mb-2">Chart Unavailable</h6>
            <p class="text-muted small mb-3">${message}</p>
            <button class="btn btn-sm btn-outline-primary" onclick="location.reload()">
                <i class="fas fa-refresh me-1"></i>Retry
            </button>
        </div>
    `;
}

/**
 * Update chart with new data
 */
function updateChart(chart, newData) {
    if (!chart) return;
    
    chart.data.labels = newData.labels;
    chart.data.datasets.forEach((dataset, index) => {
        if (newData.datasets[index]) {
            dataset.data = newData.datasets[index].data;
        }
    });
    
    chart.update('active');
}

/**
 * Resize charts when window is resized
 */
window.addEventListener('resize', function() {
    if (lifestyleChart) {
        lifestyleChart.resize();
    }
    if (weeklyProgressChart) {
        weeklyProgressChart.resize();
    }
});

/**
 * Export chart as image
 */
function exportChart(chartInstance, filename = 'health-chart.png') {
    if (!chartInstance) return;
    
    const url = chartInstance.toBase64Image();
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add animation classes to chart containers
    const chartContainers = document.querySelectorAll('.card:has(canvas)');
    chartContainers.forEach(container => {
        container.classList.add('fade-in');
    });
});

// Export functions for global use
window.HealthCharts = {
    loadLifestyleChart,
    loadWeeklyProgressChart,
    createHealthSummaryChart,
    updateChart,
    exportChart,
    showChartError
};
