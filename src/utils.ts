import axios from 'axios';
import cheerio, { load } from 'cheerio';

/**
 * Type definition for a path map where each key is a string and the value is an array of strings.
 */
interface PathMap {
    [key: string]: string[];
}

/**
 * Type definition for a set of redirect URLs.
 */
interface RedirectSet extends Set<string> { }

/**
 * Finds the shortest path between two Wikipedia pages.
 * 
 * @param {string} start - The starting Wikipedia page URL.
 * @param {RedirectSet} endSet - A set of possible ending Wikipedia page URLs.
 * @returns {Promise<string[] | null>} The shortest path as an array of URLs or null if no path is found.
 */
export async function findShortestPath(start: string, endSet: RedirectSet): Promise<string[] | null> {
    const path: PathMap = {}; // Object to store paths to each page
    path[start] = [start]; // Initialize path for the starting page
    const queue: string[] = [start]; // Initialize the queue with the starting page
    console.log("Processing...please wait");
    while (queue.length > 0) {
        const currentQueue = [...queue];
        queue.length = 0; // Clear the queue

        const pageLinkPromises = currentQueue.map(page => getLinks(page).then(links => ({ page, links })));
        const pageLinkResults = await Promise.all(pageLinkPromises);

        for (const { page, links } of pageLinkResults) {
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
    }

    return null; // Return null if no path is found
}

/**
 * Retrieves all Wikipedia links from a given page.
 * 
 * @param {string} page - The Wikipedia page URL.
 * @returns {Promise<string[]>} A list of Wikipedia links.
 */
export async function getLinks(page: string): Promise<string[]> {
    try {
        const response = await axios.get(page); // Make a GET request to the page
        const $ = load(response.data); // Load the HTML response with cheerio
        const baseUrl = page.substring(0, page.indexOf('/wiki/')); // Extract the base URL
        const links = new Set<string>(); // Use a set to store unique links

        // Select all anchor tags within paragraph tags that start with "/wiki/"
        $('p a[href^="/wiki/"]').each((_, element) => {
            const href = $(element).attr('href'); // Get the href attribute
            links.add(baseUrl + href); // Add the full URL to the set of links
        });

        return Array.from(links); // Convert the set to an array and return it
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Failed to get links from ${page}: ${error.message}`);
        } else {
            console.error(`Failed to get links from ${page}: Unknown error`);
        }
        return [];
    }
}

/**
 * Checks if the start and end Wikipedia pages are valid and in the same language.
 * 
 * @param {string} start - The starting Wikipedia page URL.
 * @param {string} end - The ending Wikipedia page URL.
 * @returns {Promise<boolean>} True if both pages are valid and in the same language, otherwise false.
 */
export async function checkPages(start: string, end: string): Promise<boolean> {
    const languages: string[] = []; // Array to store languages of the pages

    for (const page of [start, end]) {
        try {
            const index = page.indexOf('.wikipedia.org/wiki/');
            if (index === -1) throw new Error('Invalid Wikipedia URL');
            languages.push(page.substring(index - 2, index)); // Extract language code
            const response = await axios.get(page); // Make a GET request to check page validity
            if (response.status !== 200) {
                throw new Error(`Failed to fetch page: ${page}`);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`${page} does not appear to be a valid Wikipedia page: ${error.message}`);
            } else {
                console.error(`${page} does not appear to be a valid Wikipedia page: ${error}`);
            }
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
    const end$ = load(endResponse.data);
    if (end$('table.metadata.plainlinks.ambox.ambox-style.ambox-Orphan').length > 0) {
        console.error('End page is an orphan page with no Wikipedia pages linking to it.');
        return false; // Return false if the end page is an orphan page
    }

    return true; // Return true if all checks pass
}

/**
 * Handles potential redirection of the ending Wikipedia page.
 * 
 * @param {string} end - The ending Wikipedia page URL.
 * @returns {Promise<RedirectSet>} A set containing the original and redirected URLs.
 */
export async function redirected(end: string): Promise<RedirectSet> {
    try {
        const endResponse = await axios.get(end);
        const end$ = load(endResponse.data);
        const title = end$('h1').text().replace(/ /g, '_'); // Get the title of the page
        const baseUrl = end.substring(0, end.indexOf('/wiki/') + '/wiki/'.length);
        return new Set([end, baseUrl + title]); // Return a set with the original and redirected URLs
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Failed to handle redirection for ${end}: ${error.message}`);
        } else {
            console.error(`Failed to handle redirection for ${end}: Unknown error`);
        }
        return new Set([end]);
    }
}
