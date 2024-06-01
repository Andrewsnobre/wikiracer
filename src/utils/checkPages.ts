import axios from 'axios';
import { load } from 'cheerio';
import { getLinks } from './getLinks';

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
            const response = await axios.get(page, { timeout: 15000 });  // Fetch the page to check validity.
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

    const endResponse = await axios.get(end, { timeout: 15000 });
    if (!endResponse || !endResponse.data) {
        console.error('Failed to fetch end page data.');
        return false;
    }

    const end$ = load(endResponse.data);
    if (end$('table.metadata.plainlinks.ambox.ambox-style.ambox-Orphan').length > 0) {
        console.error('End page is an orphan page with no Wikipedia pages linking to it.');
        return false;  // Return false if the end page is an orphan page.
    }

    return true;  // Return true if all checks pass.
}
