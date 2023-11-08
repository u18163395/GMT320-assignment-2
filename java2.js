let data = []; // Initialize the data variable in the outer scope

// User finds the csv file
document.getElementById("CsvFile").addEventListener('change', ReadCSV);

// Process the csv data into an array
function separateByComa(csvData) {
    const lines = csvData.split('\n');
    data = [];
    const head = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
        const val = lines[i].split(',');
        const array = {};

        for (let j = 0; j < head.length; j++) {
            array[head[j]] = val[j];
        }

        data.push(array);
    }
}

// Read csv and process it with separateByComa function
function ReadCSV(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const text = e.target.result;
            separateByComa(text);

            // Make a copy of the original data array
            const originalData = [...data];
            
            const gautengData = separateOnlyGauteng(originalData);

            // Calculate monthly averages for all months
            const monthlyAverages = calculateMonthlyAverages(gautengData);

            // Extract months and averages from the monthly averages object
            const months = Object.keys(monthlyAverages);
            const monthlyAveragesValues = Object.values(monthlyAverages);

            // Filter data for January from the copy
            const januaryData = filterDataForJanuary(gautengData);

            // Extract 'retail_and_recreation_percent_change_from_baseline' values for January
            const januaryRetailChange = extractRetailChangeValues(januaryData);

            // Create a chart for January
            createChart('gautengJanuaryChart', januaryData, januaryRetailChange);

            // Create the bar chart for monthly averages
            createChart('gautengWorkMonthlyAveragesChartRetail', months, monthlyWorkAveragesValues);
        }
        reader.readAsText(file);
    }
}

// Creates a new array with data only for 'Gauteng'
function separateOnlyGauteng(data) {
    if (!data) {
        return [];
    }
    
    return data.filter(row => row.sub_region_1 === 'Gauteng');
}

// Filter data for January
function filterDataForJanuary(data) {
    return data.filter(row => {
        const date = row.date; // Assuming the date format is 'YYYY/MM/DD'
        console.log(date);
        return date.split('-')[1] === '01'; // Check if the month is January ('01')
    });
}

// Extract 'retail_and_recreation_percent_change_from_baseline' values
function extractRetailChangeValues(data) {
    return data.map(row => parseFloat(row.retail_and_recreation_percent_change_from_baseline));
}

// Create a chart using Chart.js
function createChart(elementId, chartData, dataForChart = null) {
    const ctx = document.getElementById(elementId).getContext('2d');

    const chartConfig = {
        type: 'line',
        data: {
            labels: chartData.map(row => row.date), // X-axis labels (assuming date format is 'YYYY/MM/DD')
            datasets: [
                {
                    label: 'Retail Change in Gauteng for January',
                    data: dataForChart || chartData, // Y-axis data (use provided data or the whole dataset)
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 2,
                },
            ],
        },
        options: {
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date',
                    },
                },
                y: {
                    beginAtZero: false,
                    min: -100,
                    max: 100,
                    ticks: {
                        stepSize: 25,
                    },
                    title: {
                        display: true,
                        text: 'Retail Change',
                    },
                },
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Retail Change in Gauteng for January',
                },
            },
        },
    };

    new Chart(ctx, chartConfig);
}


//Monthly chart for Workplaces Gauteng

// Calculate monthly averages for all months
function calculateMonthlyAverages(data) {
    const monthlyWorkAverages = {};

    data.forEach(row => {
        const date = row.date; // Assuming the date format is 'YYYY-MM-DD'
        const month = date.split('-')[1]; // Extract the month part

        if (!monthlyWorkAverages[month]) {
            monthlyWorkAverages[month] = [];
        }

        monthlyWorkAverages[month].push(parseFloat(row.workplaces_percent_change_from_baseline));
    });

    // Calculate the average for each month
    for (const month in monthlyWorkAverages) {
        const values = monthlyWorkAverages[month];
        const sum = values.reduce((acc, value) => acc + value, 0);
        const average = sum / values.length;
        monthlyWorkAverages[month] = average;
    }

    return monthlyWorkAverages;
}

// Extract months and averages from the monthly averages object
const months = Object.keys(monthlyWorkAverages);
const monthlyWorkAveragesValues = Object.values(monthlyWorkAverages);

// Modify the createChart function to handle bar charts
function createChart(elementId, labels, dataForChart) {
    const ctx = document.getElementById(elementId).getContext('2d');

    const chartConfig = {
        type: 'bar', // Use 'bar' chart type for bar chart
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Monthly Workplace Averages in Gauteng',
                    data: dataForChart,
                    backgroundColor: 'rgb(75, 192, 192)',
                },
            ],
        },
        options: {
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Month',
                    },
                },
                y: {
                    beginAtZero: false,
                    min: -100,
                    max: 100,
                    ticks: {
                        stepSize: 25,
                    },
                    title: {
                        display: true,
                        text: 'Workplace Average',
                    },
                },
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Monthly Workplace Averages in Gauteng',
                },
            },
        },
    };

    new Chart(ctx, chartConfig);
}