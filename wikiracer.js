const axios = require('axios'); // Importing axios for making HTTP requests
const cheerio = require('cheerio'); // Importing cheerio for parsing HTML
const { argv } = require('yargs') // Importing yargs for handling command-line arguments
    .usage('Usage: $0 --start <startPage> --end <endPage>')
    .demandOption(['start', 'end']); // Making 'start' and 'end' arguments mandatory

// Function to find the shortest path between two Wikipedia pages
async function findShortestPath(start, endSet) {
    const path = {}; // Object to store paths to each page
    path[start] = [start]; // Initialize path for the starting page
    const queue = [start]; // Initialize the queue with the starting page

    while (queue.length > 0) {
        const page = queue.shift(); // Dequeue a page from the front
        const links = await getLinks(page); // Get links from the current page

        for (const link of links) {
            if (endSet.has(link)) { // Check if the current link is in the end set
                return path[page].concat(link); // Return the path if end is found
            }

            if (!path[link] && link !== page) { // If the link hasn't been visited
                path[link] = path[page].concat(link); // Store the path to this link
                queue.push(link); // Enqueue the link for further exploration
            }
        }
    }

    return null; // Return null if no path is found
}

// Function to get all links from a Wikipedia page
async function getLinks(page) {
    try {
        const response = await axios.get(page); // Make a GET request to the page
        const $ = cheerio.load(response.data); // Load the HTML response with cheerio
        const baseUrl = page.substring(0, page.indexOf('/wiki/')); // Extract the base URL
        const links = new Set(); // Use a set to store unique links

        // Select all anchor tags within paragraph tags that start with "/wiki/"
        $('p a[href^="/wiki/"]').each((_, element) => {
            const href = $(element).attr('href'); // Get the href attribute
            links.add(baseUrl + href); // Add the full URL to the set of links
        });

        return Array.from(links); // Convert the set to an array and return it
    } catch (error) {
        console.error(`Failed to get links from ${page}: ${error.message}`);
        return [];
    }
}

// Function to check if the start and end pages are valid and in the same language
async function checkPages(start, end) {
    const languages = []; // Array to store languages of the pages

    for (const page of [start, end]) {
        try {
            const index = page.indexOf('.wikipedia.org/wiki/');
            if (index === -1) throw new Error('Invalid Wikipedia URL');
            languages.push(page.substring(index - 2, index)); // Extract language code
            await axios.get(page); // Make a GET request to check page validity
        } catch (error) {
            console.error(`${page} does not appear to be a valid Wikipedia page: ${error.message}`);
            return false; // Return false if the page is invalid
        }
    }

    if (new Set(languages).size > 1) { // Check if pages are in different languages
        console.error('Pages are in different languages.');
        return false; // Return false if they are
    }

    if ((await getLinks(start)).length === 0) { // Check if the start page has no links
        console.error('Start page is a dead-end page with no Wikipedia links.');
        return false; // Return false if it has no links
    }

    const endResponse = await axios.get(end);
    const end$ = cheerio.load(endResponse.data);
    if (end$('table.metadata.plainlinks.ambox.ambox-style.ambox-Orphan').length > 0) {
        console.error('End page is an orphan page with no Wikipedia pages linking to it.');
        return false; // Return false if the end page is an orphan page
    }

    return true; // Return true if all checks pass
}

// Function to handle potential redirection of the end page
async function redirected(end) {
    try {
        const endResponse = await axios.get(end);
        const end$ = cheerio.load(endResponse.data);
        const title = end$('h1').text().replace(/ /g, '_'); // Get the title of the page
        const baseUrl = end.substring(0, end.indexOf('/wiki/') + '/wiki/'.length);
        return new Set([end, baseUrl + title]); // Return a set with the original and redirected URLs
    } catch (error) {
        console.error(`Failed to handle redirection for ${end}: ${error.message}`);
        return new Set([end]);
    }
}

// Main function to execute the script
async function main() {
    const start = argv.start; // Get the start page from command-line arguments
    const end = argv.end; // Get the end page from command-line arguments

    if (await checkPages(start, end)) { // Check if the pages are valid
        const endSet = await redirected(end); // Get the set of possible end URLs
        const path = await findShortestPath(start, endSet); // Find the shortest path
        if (path) {
            console.log(path); // Log the path
        } else {
            console.log('No path found!');
        }
    }
}

const startTime = Date.now(); // Record the start time
main().then(() => {
    const endTime = Date.now(); // Record the end time
    const totalTime = (endTime - startTime) / 1000; // Calculate the total execution time
    console.log(`Execution Time: ${Math.floor(totalTime / 60)}m ${(totalTime % 60).toFixed(3)}s`);
});
