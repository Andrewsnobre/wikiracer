const axios = require('axios');
const cheerio = require('cheerio');
const { argv } = require('yargs')
    .usage('Usage: $0 --start <startPage> --end <endPage>')
    .demandOption(['start', 'end']);

async function findPath(start, end) {
    const path = [];
    path.push(start);
    const queue = [start];

    while (queue.length > 0) {
        const page = queue.shift();
        const links = await getLinks(page);

        for (const link of links) {
            if (link === end) {
                path.push(end);
                return path;
            }

            if (!path.includes(link) && link !== page) {
                path.push(link);
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
    const links = [];

    $('p a[href^="/wiki/"]').each((_, element) => {
        const href = $(element).attr('href');
        links.push(baseUrl + href);
    });

    return links;
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

    return true;
}

async function main() {
    const start = argv.start;
    const end = argv.end;

    if (await checkPages(start, end)) {
        const path = await findPath(start, end);
        const jsonResult = JSON.stringify({ start, end, path: path || "No path! :(" }, null, 4);
        console.log(jsonResult);
    }
}

main();
