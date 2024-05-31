import axios from 'axios';
import { load } from 'cheerio';
import { retry } from './retry';

/**
 * Retrieves all Wikipedia links from a given page.
 * 
 * @param {string} page - The URL of the Wikipedia page.
 * @returns {Promise<string[]>} - A list of Wikipedia links.
 */
export async function getLinks(page: string): Promise<string[]> {
    try {
        const response = await retry(() => axios.get(page, { timeout: 30000 }), 3, 2000);  // Fetch the page with retries.
        const $ = load(response.data);  // Load the HTML response with cheerio.
        const baseUrl = page.substring(0, page.indexOf('/wiki/'));  // Extract the base URL.
        const links = new Set<string>();  // Use a set to store unique links.

        $('p a[href^="/wiki/"]').each((_, element) => {
            const href = $(element).attr('href');  // Get the href attribute.
            links.add(baseUrl + href);  // Add the full URL to the set of links.
        });

        return Array.from(links);  // Convert the set to an array and return it.
    } catch (error) {
        console.error(`Failed to get links for ${page}: ${error}`);
        return [];
    }
}
