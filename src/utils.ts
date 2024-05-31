import axios from 'axios';
import { load } from 'cheerio';

/**
 * Interface representing a path map where each key is a string (URL) and the value is an array of strings (URLs).
 */
interface PathMap {
    [key: string]: string[];
}

/**
 * Interface representing a set of redirect URLs.
 */
interface RedirectSet extends Set<string> {}

/**
 * Retries a given function a specified number of times with a delay between retries.
 * 
 * @param fn - The function to retry.
 * @param retries - The number of times to retry the function.
 * @param delay - The delay between retries in milliseconds.
 * @returns The result of the function if successful, otherwise throws an error.
 */
async function retry<T>(fn: () => Promise<T>, retries: number, delay: number): Promise<T> {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
    throw new Error('Max retries reached');
}

/**
 * Finds the first path between two Wikipedia pages using BFS (Breadth-First Search).
 * 
 * @param {string} start - The URL of the starting Wikipedia page.
 * @param {RedirectSet} endSet - A set of possible ending Wikipedia page URLs.
 * @returns {Promise<string[] | null>} - The first path found as an array of URLs, or null if no path is found.
 */
export async function findFirstPath(start: string, endSet: RedirectSet): Promise<string[] | null> {
    const path: PathMap = { [start]: [start] };  // Initialize the path map with the start URL.
    const queue: string[] = [start];  // Initialize the queue with the start URL.

    console.log("Processing...please wait");
    while (queue.length > 0) {
        const currentQueue = [...queue];
        queue.length = 0;  // Clear the queue.

        const pageLinkPromises = currentQueue.map(page => getLinks(page).then(links => ({ page, links })));
        const pageLinkResults = await Promise.all(pageLinkPromises);  // Fetch links from all pages in the current queue.

        for (const { page, links } of pageLinkResults) {
            for (const link of links) {
                if (endSet.has(link)) {  // Check if the current link is in the end set.
                    return path[page].concat(link);  // Return the path if the end page is found.
                }

                if (!path[link] && link !== page) {  // If the link hasn't been visited.
                    path[link] = path[page].concat(link);  // Store the path to this link.
                    queue.push(link);  // Enqueue the link for further exploration.
                }
            }
        }
    }

    return null;  // Return null if no path is found.
}

/**
 * Finds the shortest path between two Wikipedia pages using BFS (Breadth-First Search).
 * 
 * @param {string} start - The URL of the starting Wikipedia page.
 * @param {RedirectSet} endSet - A set of possible ending Wikipedia page URLs.
 * @returns {Promise<string[] | null>} - The shortest path found as an array of URLs, or null if no path is found.
 */
export async function findShortestPath(start: string, endSet: RedirectSet): Promise<string[] | null> {
    const path: PathMap = { [start]: [start] };  // Initialize the path map with the start URL.
    const queue: string[] = [start];  // Initialize the queue with the start URL.

    console.log("Processing...please wait");
    while (queue.length > 0) {
        const currentQueue = [...queue];
        queue.length = 0;  // Clear the queue.

        const pageLinkPromises = currentQueue.map(page => getLinks(page).then(links => ({ page, links })));
        const pageLinkResults = await Promise.all(pageLinkPromises);  // Fetch links from all pages in the current queue.

        for (const { page, links } of pageLinkResults) {
            for (const link of links) {
                if (endSet.has(link)) {  // Check if the current link is in the end set.
                    return path[page].concat(link);  // Return the path if the end page is found.
                }

                if (!path[link] && link !== page) {  // If the link hasn't been visited.
                    path[link] = path[page].concat(link);  // Store the path to this link.
                    queue.push(link);  // Enqueue the link for further exploration.
                }
            }
        }
    }

    return null;  // Return null if no path is found.
}

/**
 * Retrieves all Wikipedia links from a given page.
 * 
 * @param {string} page - The URL of the Wikipedia page.
 * @returns {Promise<string[]>} - A list of Wikipedia links.
 */
export async function getLinks(page: string): Promise<string[]> {
    try {
        const response = await retry(() => axios.get(page, { timeout: 8000 }), 3, 2000);  // Fetch the page with retries.
        const $ = load(response.data);  // Load the HTML response with cheerio.
        const baseUrl = page.substring(0, page.indexOf('/wiki/'));  // Extract the base URL.
        const links = new Set<string>();  // Use a set to store unique links.

        $('p a[href^="/wiki/"]').each((_, element) => {
            const href = $(element).attr('href');  // Get the href attribute.
            links.add(baseUrl + href);  // Add the full URL to the set of links.
        });

        return Array.from(links);  // Convert the set to an array and return it.
    } catch (error) {
       // console.error(`Failed to get links for ${page}: ${error.message}`);
        return [];
    }
}

/**
 * Checks if the start and end Wikipedia pages are valid and in the same language.
 * 
 * @param {string} start - The URL of the starting Wikipedia page.
 * @param {string} end - The URL of the ending Wikipedia page.
 * @returns {Promise<boolean>} - True if both pages are valid and in the same language, otherwise false.
 */
export async function checkPages(start: string, end: string): Promise<boolean> {
    const languages: string[] = [];  // Array to store languages of the pages.

    for (const page of [start, end]) {
        try {
            const index = page.indexOf('.wikipedia.org/wiki/');
            if (index === -1) throw new Error('Invalid Wikipedia URL');
            languages.push(page.substring(index - 2, index));  // Extract the language code.
            const response = await axios.get(page, { timeout: 5000 });  // Fetch the page to check validity.
            if (response.status !== 200) {
                throw new Error(`Failed to fetch page: ${page}`);
            }
        } catch (error) {
            console.error(`${page} does not appear to be a valid Wikipedia page: ${error}`);
            return false;  // Return false if the page is invalid.
        }
    }

    if (new Set(languages).size > 1) {  // Check if pages are in different languages.
        console.error('Pages are in different languages.');
        return false;  // Return false if they are.
    }

    if ((await getLinks(start)).length === 0) {  // Check if the start page has no links.
        console.error('Start page is a dead-end page with no Wikipedia links.');
        return false;  // Return false if it has no links.
    }

    const endResponse = await axios.get(end, { timeout: 5000 });
    const end$ = load(endResponse.data);
    if (end$('table.metadata.plainlinks.ambox.ambox-style.ambox-Orphan').length > 0) {
        console.error('End page is an orphan page with no Wikipedia pages linking to it.');
        return false;  // Return false if the end page is an orphan page.
    }

    return true;  // Return true if all checks pass.
}

/**
 * Handles potential redirection of the ending Wikipedia page.
 * 
 * @param {string} end - The URL of the ending Wikipedia page.
 * @returns {Promise<RedirectSet>} - A set containing the original and redirected URLs.
 */
export async function redirected(end: string): Promise<RedirectSet> {
    try {
        const endResponse = await axios.get(end, { timeout: 5000 });
        const end$ = load(endResponse.data);
        const title = end$('h1').text().replace(/ /g, '_');  // Get the title of the page.
        const baseUrl = end.substring(0, end.indexOf('/wiki/') + '/wiki/'.length);
        return new Set([end, baseUrl + title]);  // Return a set with the original and redirected URLs.
    } catch (error) {
        console.error(`Failed to handle redirection for ${end}: ${error}`);
        return new Set([end]);
    }
}
