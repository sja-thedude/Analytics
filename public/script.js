// Function to parse a TSV file from a URL
async function parseTSV(filename) {
    try {
        const response = await fetch(filename);
        const data = await response.text();
        return d3.tsvParse(data);
    } catch (error) {
        console.error('Error parsing TSV:', error);
        throw error; // Propagate the error for handling
    }
}

// Load and process the dataset
async function loadData() {
    try {
        const [
            contactsData, contentData, eventsData, 
            organisationsData, recommendationsData, usersData
        ] = await Promise.all([
            parseTSV('/data/contacts.tsv'),
            parseTSV('/data/content.tsv'),
            parseTSV('/data/events.tsv'),
            parseTSV('/data/organisations.tsv'),
            parseTSV('/data/recommendations.tsv'),
            parseTSV('/data/users.tsv')
        ]);

        console.log('Contacts Data:', contactsData);
        console.log('Content Data:', contentData);
        console.log('Events Data:', eventsData);
        console.log('Organisations Data:', organisationsData);
        console.log('Recommendations Data:', recommendationsData);
        console.log('Users Data:', usersData);

        // Example analysis for contacts data
        analyzeAndDisplayData(contactsData, 'role_id', 'role_id', 'contacts-chart', 'Contacts Count by Role', 'report-contacts');

        // Example analysis for content data
        analyzeAndDisplayData(contentData, 'content_type', 'content_type', 'content-chart', 'Content Count by Type', 'report-content');

        // Example analysis for events data
        analyzeAndDisplayData(eventsData, 'event_type', 'event_type', 'events-chart', 'Events Count by Type', 'report-events');

        // Example analysis for organisations data
        analyzeAndDisplayData(organisationsData, 'industry', 'industry', 'organisations-chart', 'Organisations Count by Industry', 'report-organisations');

        // Example analysis for recommendations data
        analyzeAndDisplayData(recommendationsData, 'asset_type', 'asset_type', 'recommendations-chart', 'Recommendations Count by Asset Type', 'report-recommendations');

        // Example analysis for users data
        analyzeAndDisplayData(usersData, 'role_id', 'role_id', 'users-chart', 'Users Count by Role', 'report-users');

    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Helper function to analyze data and create charts and reports
function analyzeAndDisplayData(data, groupByField, displayField, chartContainer, reportTitle, reportContainer) {
    if (!data.length) {
        console.error(`No data available for ${reportTitle}`);
        return;
    }
    console.log(`Analyzing data for ${reportTitle}`);
    const groupedData = _.groupBy(data, groupByField);
    console.log(`Grouped data for ${reportTitle}:`, groupedData);
    const countData = Object.keys(groupedData).map(key => ({
        key,
        display: groupedData[key][0][displayField] || 'undefined',
        count: groupedData[key].length
    }));
    console.log(`Count data for ${reportTitle}:`, countData);

    createBarChart(countData, chartContainer, displayField, 'Count');
    generateReport(countData, reportTitle, reportContainer);
}

// Function to create a bar chart using D3.js
function createBarChart(data, containerId, xLabel, yLabel) {
    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', 400)
        .attr('height', 300);

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;

    const x = d3.scaleBand()
        .range([margin.left, width - margin.right])
        .padding(0.1)
        .domain(data.map(d => d.display));

    const y = d3.scaleLinear()
        .range([height - margin.bottom, margin.top])
        .domain([0, d3.max(data, d => d.count)]);

    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.display))
        .attr('y', d => y(d.count))
        .attr('width', x.bandwidth())
        .attr('height', d => height - margin.bottom - y(d.count));
}

// Function to generate a report
function generateReport(data, title, containerId) {
    const reportContainer = document.getElementById(containerId);
    reportContainer.innerHTML = '';

    const reportHeader = document.createElement('h2');
    reportHeader.textContent = title;
    reportContainer.appendChild(reportHeader);

    const reportList = document.createElement('ul');
    data.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.display}: ${item.count}`;
        reportList.appendChild(listItem);
    });
    reportContainer.appendChild(reportList);
}

// Call the loadData function to start the analytics engine
loadData();
