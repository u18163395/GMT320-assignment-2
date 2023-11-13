let data = [];

// User finds the csv file
document.getElementById("CsvFile").addEventListener('change', ReadCSV);

//csv data into an array
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
            const monthlyAverages = calculateMonthlyAveragesForWorkGraph(gautengData);
            // Calculate monthly averages for Gauteng
            const gautengMonthlyAverages = calculateMonthlyAveragesForGroceryGraph(gautengData);
            // Separate data for Eastern Cape
            const easternCapeData = separateOnlyEasternCape(originalData);

            // Calculate monthly averages for Eastern Cape
            const easternCapeMonthlyAverages = calculateMonthlyAveragesForGroceryGraph(easternCapeData);
            // Extract months and averages from the monthly averages object
            const months = Object.keys(monthlyAverages);
            const monthlyWorkAveragesValues = Object.values(monthlyAverages);
            const gautengAveragesValues = Object.values(gautengMonthlyAverages);
            const easternCapeAveragesValues = Object.values(easternCapeMonthlyAverages);
            
            // Filter data for January from the copy
            const januaryData = filterDataForJanuary(gautengData);

            // Extract 'retail_and_recreation_percent_change_from_baseline' values for January
            const januaryRetailChange = extractRetailChangeValues(januaryData);
            //Months for WorkChart
            const monthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October'];
            const DayLabels = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23',
            '24','25','26','27','28','29','30','31']
            
            createChart('gautengJanuaryChart', DayLabels, januaryRetailChange);

            
            createChart2('gautengWorkMonthlyAveragesChartRetail',monthLabels, monthlyWorkAveragesValues);

            
            createChart3('GautengECapeGroceryPharmacyChart', monthLabels, gautengAveragesValues, easternCapeAveragesValues);
        }
        reader.readAsText(file);
    }
}

//Function to create new array
function separateOnlyGauteng(data) {
    
    return data.filter(row => row.sub_region_1 === 'Gauteng');
}

//Function to create new array
function filterDataForJanuary(data) {
    return data.filter(row => {
        const date = row.date; 
        console.log(date);
        return date.split('-')[1] === '01';
    });
}


function extractRetailChangeValues(data) {
    return data.map(row => parseFloat(row.retail_and_recreation_percent_change_from_baseline));
}

//Chart 1
function createChart(elementId, labels, dataForChart) {
    const ctx = document.getElementById(elementId).getContext('2d');

    const chartConfig = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Retail&Recreation Change',
                    data: dataForChart || chartData,
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
                        text: 'Day',
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
                        text: 'Retail&Recreation Change',
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
                    text: 'Retail&Recreation Change in Gauteng for January 2022',
                },
            },
        },
    };

    new Chart(ctx, chartConfig);
}


function calculateMonthlyAveragesForWorkGraph(data) {
    const monthlyWorkAverages = {};

    data.forEach(row => {
        const date = row.date; 
        const month = date.split('-')[1];

        if (!monthlyWorkAverages[month]) {
            monthlyWorkAverages[month] = [];
        }

        monthlyWorkAverages[month].push(parseFloat(row.workplaces_percent_change_from_baseline));
    });


    //Calculate the average for each month
    for (const month in monthlyWorkAverages) {
        const values = monthlyWorkAverages[month];
        const sum = values.reduce((acc, value) => acc + value, 0);
        const average = sum / values.length;
        monthlyWorkAverages[month] = average;
    }
    return monthlyWorkAverages;
}

//Chart 2
function createChart2(elementId, labels, dataForChart) {
    const ctx = document.getElementById(elementId).getContext('2d');

    const chartConfig = {
        type: 'bar',
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
                    text: 'Monthly Workplace  Average Changes in Gauteng for 2022',
                },
            },
        },
    };

    new Chart(ctx, chartConfig);
}
//Function to create new array for only EasternCape data
function separateOnlyEasternCape(data) {
    return data.filter(row => row.sub_region_1 === 'Eastern Cape');
}
function calculateMonthlyAveragesForGroceryGraph(data) {
    const monthlyGroceryAverages = {};

    data.forEach(row => {
        const date = row.date;
        const month = date.split('-')[1];

        if (!monthlyGroceryAverages[month]) {
            monthlyGroceryAverages[month] = [];
        }

        monthlyGroceryAverages[month].push(parseFloat(row.grocery_and_pharmacy_percent_change_from_baseline));
    });


    // Calculate the average for each month
    for (const month in monthlyGroceryAverages) {
        const values = monthlyGroceryAverages[month];
        const sum = values.reduce((acc, value) => acc + value, 0);
        const average = sum / values.length;
        monthlyGroceryAverages[month] = average;
    }
    return monthlyGroceryAverages;
}


function createChart3(elementId, labels, dataForChart1, dataForChart2) {
    const ctx = document.getElementById(elementId).getContext('2d');

    const chartConfig = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Gauteng',
                    data: dataForChart1,
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 2,
                },
                {
                    label: 'Eastern Cape',
                    data: dataForChart2,
                    borderColor: 'rgb(192, 75, 192)',
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
                        text: 'Month',
                    },
                },
                y: {
                    beginAtZero: false,
                    ticks: {
                        stepSize: 25,
                    },
                    title: {
                        display: true,
                        text: 'Grocery & Pharmacy Average Change',
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
                    text: 'Monthly Grocery & Pharmacy Average Changes for Gauteng and Eastern Cape for 2022',
                },
            },
        },
    };

    new Chart(ctx, chartConfig);
}