// src/index.js
const fs = require('fs');
const csv = require('csv-parser');
const d3 = require('d3');
const { groupBy } = require('lodash');

const dataDir = './data'; // Adjust the path as per your directory structure

// Function to read and parse TSV files
function parseTSV(filename) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(`${dataDir}/${filename}`)
            .pipe(csv({ separator: '\t' })) // Specify tab as the delimiter
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

// Example usage
async function main() {
    try {
        const contactsData = await parseTSV('./data/contacts.tsv');
        const contentData = await parseTSV('./data/content.tsv');
        const eventsData = await parseTSV('./data/events.tsv');
        const organisationsData = await parseTSV('./data/organisations.tsv');
        const recommendationsData = await parseTSV('./data/recommendations.tsv');
        const usersData = await parseTSV('./data/users.tsv');

        // Perform data analysis
        // Example: Calculate counts of contacts by role
        const contactsByRole = groupBy(contactsData, 'role_id');
        const contactsCountByRole = Object.keys(contactsByRole).map(roleId => ({
            roleId,
            role: contactsByRole[roleId][0].role,
            count: contactsByRole[roleId].length
        }));
        console.log('Contacts Count by Role:', contactsCountByRole);

        // Create visualizations with D3.js
        // Example: Create a bar chart of contacts count by role
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = 400 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        const svg = d3.select('body')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(contactsCountByRole.map(d => d.role))
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(contactsCountByRole, d => d.count)])
            .range([height, 0]);

        svg.selectAll('.bar')
            .data(contactsCountByRole)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.role))
            .attr('width', x.bandwidth())
            .attr('y', d => y(d.count))
            .attr('height', d => height - y(d.count));

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append('g')
            .call(d3.axisLeft(y));
    } catch (error) {
        console.error('Error:', error);
    }
}

main();