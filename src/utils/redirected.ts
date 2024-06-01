import axios from 'axios';
import { load } from 'cheerio';

/**
 * Handles potential redirection of the ending Wikipedia page.
 * 
 * @param {string} end - The URL of the ending Wikipedia page.
 * @returns {Promise<Set<string>>} - A set containing the original and redirected URLs.
 */
export async function redirected(end: string): Promise<Set<string>> {
    try {
        const endResponse = await axios.get(end, { timeout: 15000 });
        const end$ = load(endResponse.data);
        const title = end$('h1').text().replace(/ /g, '_');  // Get the title of the page.
        const baseUrl = end.substring(0, end.indexOf('/wiki/') + '/wiki/'.length);
        return new Set([end, baseUrl + title]);  // Return a set with the original and redirected URLs.
    } catch (error) {
        console.error(`Failed to handle redirection for ${end}: ${error}`);
        return new Set([end]);
    }
}
