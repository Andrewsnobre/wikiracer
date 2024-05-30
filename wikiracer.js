const axios = require('axios');
const cheerio = require('cheerio');
const { argv } = require('yargs')
    .usage('Usage: $0 --start <startPage> --end <endPage>')
    .demandOption(['start', 'end']);

async function findShortestPath(start, end) {
    const path = {};
    path[start] = [start];
    const queue = [start];

    while (queue.length > 0) {
        const page = queue.shift();
        const links = await getLinks(page);

        for (const link of links) {
            if (end.has(link)) {
                return path[page].concat(link);
            }

            if (!path[link] && link !== page) {
                path[link] = path[page].concat(link);
                queue.push(link);
            }
        }
    }

    return null;
}

async function getLinks(page) {
    const response = await axios.get(page);
    const $ = cheerio.load(response.data);
    const baseUrl = page.substring(0, page.indexOf('/wiki/'));
    const links = new Set();

    $('p a[href^="/wiki/"]').each((_, element) => {
        const href = $(element).attr('href');
        links.add(baseUrl + href);
    });

    return Array.from(links);
}

async function checkPages(start, end) {
    const languages = [];

    for (const page of [start, end]) {
        try {
            const index = page.indexOf('.wikipedia.org/wiki/');
            languages.push(page.substring(index - 2, index));
            await axios.get(page);
        } catch (error) {
            console.error(`${page} does not appear to be a valid Wikipedia page.`);
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

    const endResponse = await axios.get(end);
    const end$ = cheerio.load(endResponse.data);
    if (end$('table.metadata.plainlinks.ambox.ambox-style.ambox-Orphan').length > 0) {
        console.error('End page is an orphan page with no Wikipedia pages linking to it.');
        return false;
    }

    return true;
}

async function redirected(end) {
    const endResponse = await axios.get(end);
    const end$ = cheerio.load(endResponse.data);
    const title = end$('h1').text().replace(/ /g, '_');
    const baseUrl = end.substring(0, end.indexOf('/wiki/') + '/wiki/'.length);
    return new Set([end, baseUrl + title]);
}

function result(start, end, path) {
    return JSON.stringify({ start, end, path: path || "No path! :(" }, null, 4);
}

async function main() {
    const start = argv.start;
    const end = argv.end;

    if (await checkPages(start, end)) {
        const path = await findShortestPath(start, await redirected(end));
        const jsonResult = result(start, end, path);
        console.log(jsonResult);
    }
}

const startTime = Date.now();
main().then(() => {
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    console.log(`Time: ${Math.floor(totalTime / 60)}m ${(totalTime % 60).toFixed(3)}s`);
});
