import axios from 'axios';
import { load } from 'cheerio';

interface PathMap {
    [key: string]: string[];
}

interface RedirectSet extends Set<string> {}

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

export async function findFirstPath(start: string, endSet: RedirectSet): Promise<string[] | null> {
    const path: PathMap = { [start]: [start] };
    const queue: string[] = [start];

    console.log("Processing...please wait");
    while (queue.length > 0) {
        const currentQueue = [...queue];
        queue.length = 0;

        const pageLinkPromises = currentQueue.map(page => getLinks(page).then(links => ({ page, links })));
        const pageLinkResults = await Promise.all(pageLinkPromises);

        for (const { page, links } of pageLinkResults) {
            for (const link of links) {
                if (endSet.has(link)) {
                    return path[page].concat(link);
                }

                if (!path[link] && link !== page) {
                    path[link] = path[page].concat(link);
                    queue.push(link);
                }
            }
        }
    }

    return null;
}

export async function findShortestPath(start: string, endSet: RedirectSet): Promise<string[] | null> {
    const path: PathMap = { [start]: [start] };
    const queue: string[] = [start];

    console.log("Processing...please wait");
    while (queue.length > 0) {
        const currentQueue = [...queue];
        queue.length = 0;

        const pageLinkPromises = currentQueue.map(page => getLinks(page).then(links => ({ page, links })));
        const pageLinkResults = await Promise.all(pageLinkPromises);

        for (const { page, links } of pageLinkResults) {
            for (const link of links) {
                if (endSet.has(link)) {
                    return path[page].concat(link);
                }

                if (!path[link] && link !== page) {
                    path[link] = path[page].concat(link);
                    queue.push(link);
                }
            }
        }
    }

    return null;
}

export async function getLinks(page: string): Promise<string[]> {
    try {
        const response = await retry(() => axios.get(page, { timeout: 8000 }), 3, 2000);
        const $ = load(response.data);
        const baseUrl = page.substring(0, page.indexOf('/wiki/'));
        const links = new Set<string>();

        $('p a[href^="/wiki/"]').each((_, element) => {
            const href = $(element).attr('href');
            links.add(baseUrl + href);
        });

        return Array.from(links);
    } catch (error) {
       // console.error(`Failed to get links for ${page}: ${error.message}`);
        return [];
    }
}

export async function checkPages(start: string, end: string): Promise<boolean> {
    const languages: string[] = [];

    for (const page of [start, end]) {
        try {
            const index = page.indexOf('.wikipedia.org/wiki/');
            if (index === -1) throw new Error('Invalid Wikipedia URL');
            languages.push(page.substring(index - 2, index));
            const response = await axios.get(page, { timeout: 5000 });
            if (response.status !== 200) {
                throw new Error(`Failed to fetch page: ${page}`);
            }
        } catch (error) {
            console.error(`${page} does not appear to be a valid Wikipedia page: ${error}`);
            return false;
        }
    }

    if (new Set(languages).size > 1) {
        console.error('Pages are in different languages.');
        return false;
    }

    if ((await getLinks(start)).length === 0) {
        console.error('Start page is a dead-end page with no Wikipedia links.');
        return false;
    }

    const endResponse = await axios.get(end, { timeout: 5000 });
    const end$ = load(endResponse.data);
    if (end$('table.metadata.plainlinks.ambox.ambox-style.ambox-Orphan').length > 0) {
        console.error('End page is an orphan page with no Wikipedia pages linking to it.');
        return false;
    }

    return true;
}

export async function redirected(end: string): Promise<RedirectSet> {
    try {
        const endResponse = await axios.get(end, { timeout: 5000 });
        const end$ = load(endResponse.data);
        const title = end$('h1').text().replace(/ /g, '_');
        const baseUrl = end.substring(0, end.indexOf('/wiki/') + '/wiki/'.length);
        return new Set([end, baseUrl + title]);
    } catch (error) {
        console.error(`Failed to handle redirection for ${end}: ${error}`);
        return new Set([end]);
    }
}
