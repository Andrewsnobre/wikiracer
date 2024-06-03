import pLimit from 'p-limit';
import { getLinks } from './getLinks';

// Configure a limit of concurrent requests
const limit = pLimit(30); // 30 concurrent requests

/**
 * Interface representing a path map where each key is a string (URL) and the value is an array of strings (URLs).
 */
interface PathMap {
    [key: string]: string[];
}

/**
 * Interface representing a set of redirect URLs.
 */
interface RedirectSet extends Set<string> { }

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
    const visited: Set<string> = new Set([start]);  // Track visited pages

    console.log("Processing...please wait");
    while (queue.length > 0) {
        const currentQueue = [...queue];
        queue.length = 0;  // Clear the queue.

        const pageLinkPromises = currentQueue.map(page =>
            limit(() => getLinks(page).then(links => ({ page, links })))
        );
        const pageLinkResults = await Promise.all(pageLinkPromises);  // Fetch links from all pages in the current queue.

        for (const { page, links } of pageLinkResults) {
            for (const link of links) {
                if (endSet.has(link)) {  // Check if the current link is in the end set.
                    return path[page].concat(link);  // Return the path if the end page is found.
                }

                if (!visited.has(link) && link !== page) {  // If the link hasn't been visited.
                    visited.add(link);  // Mark the link as visited.
                    path[link] = path[page].concat(link);  // Store the path to this link.
                    queue.push(link);  // Enqueue the link for further exploration.
                }
            }
        }
    }

    return null;  // Return null if no path is found.
}
