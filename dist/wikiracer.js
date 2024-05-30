"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios")); // Importing axios for making HTTP requests
const cheerio_1 = __importStar(require("cheerio")); // Importing cheerio for parsing HTML
const yargs_1 = __importDefault(require("yargs")); // Importing yargs for handling command-line arguments
const helpers_1 = require("yargs/helpers"); // Importing helper to handle process arguments
const argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .usage('Usage: $0 --start <startPage> --end <endPage>')
    .demandOption(['start', 'end'])
    .argv;
/**
 * Finds the shortest path between two Wikipedia pages.
 * @param start - The starting Wikipedia page URL.
 * @param endSet - A set of possible ending Wikipedia page URLs.
 * @returns The shortest path or null if no path is found.
 */
function findShortestPath(start, endSet) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = {}; // Object to store paths to each page
        path[start] = [start]; // Initialize path for the starting page
        const queue = [start]; // Initialize the queue with the starting page
        while (queue.length > 0) {
            const currentQueue = [...queue];
            queue.length = 0; // Clear the queue
            const pageLinkPromises = currentQueue.map(page => getLinks(page).then(links => ({ page, links })));
            const pageLinkResults = yield Promise.all(pageLinkPromises);
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
    });
}
/**
 * Retrieves all Wikipedia links from a given page.
 * @param page - The Wikipedia page URL.
 * @returns A list of Wikipedia links.
 */
function getLinks(page) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(page); // Make a GET request to the page
            const $ = (0, cheerio_1.load)(response.data); // Load the HTML response with cheerio
            const baseUrl = page.substring(0, page.indexOf('/wiki/')); // Extract the base URL
            const links = new Set(); // Use a set to store unique links
            // Select all anchor tags within paragraph tags that start with "/wiki/"
            $('p a[href^="/wiki/"]').each((_, element) => {
                const href = $(element).attr('href'); // Get the href attribute
                links.add(baseUrl + href); // Add the full URL to the set of links
            });
            return Array.from(links); // Convert the set to an array and return it
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.error(`Failed to get links from ${page}: ${error.message}`);
            }
            else {
                console.error(`Failed to get links from ${page}: Unknown error`);
            }
            return [];
        }
    });
}
/**
 * Checks if the start and end Wikipedia pages are valid and in the same language.
 * @param start - The starting Wikipedia page URL.
 * @param end - The ending Wikipedia page URL.
 * @returns True if both pages are valid and in the same language, otherwise false.
 */
function checkPages(start, end) {
    return __awaiter(this, void 0, void 0, function* () {
        const languages = []; // Array to store languages of the pages
        for (const page of [start, end]) {
            try {
                const index = page.indexOf('.wikipedia.org/wiki/');
                if (index === -1)
                    throw new Error('Invalid Wikipedia URL');
                languages.push(page.substring(index - 2, index)); // Extract language code
                yield axios_1.default.get(page); // Make a GET request to check page validity
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error)) {
                    console.error(`${page} does not appear to be a valid Wikipedia page: ${error.message}`);
                }
                else {
                    console.error(`${page} does not appear to be a valid Wikipedia page: Unknown error`);
                }
                return false; // Return false if the page is invalid
            }
        }
        if (new Set(languages).size > 1) { // Check if pages are in different languages
            console.error('Pages are in different languages.');
            return false; // Return false if they are
        }
        if ((yield getLinks(start)).length === 0) { // Check if the start page has no links
            console.error('Start page is a dead-end page with no Wikipedia links.');
            return false; // Return false if it has no links
        }
        const endResponse = yield axios_1.default.get(end);
        const end$ = cheerio_1.default.load(endResponse.data);
        if (end$('table.metadata.plainlinks.ambox.ambox-style.ambox-Orphan').length > 0) {
            console.error('End page is an orphan page with no Wikipedia pages linking to it.');
            return false; // Return false if the end page is an orphan page
        }
        return true; // Return true if all checks pass
    });
}
/**
 * Handles potential redirection of the ending Wikipedia page.
 * @param end - The ending Wikipedia page URL.
 * @returns A set containing the original and redirected URLs.
 */
function redirected(end) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const endResponse = yield axios_1.default.get(end);
            const end$ = cheerio_1.default.load(endResponse.data);
            const title = end$('h1').text().replace(/ /g, '_'); // Get the title of the page
            const baseUrl = end.substring(0, end.indexOf('/wiki/') + '/wiki/'.length);
            return new Set([end, baseUrl + title]); // Return a set with the original and redirected URLs
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.error(`Failed to handle redirection for ${end}: ${error.message}`);
            }
            else {
                console.error(`Failed to handle redirection for ${end}: Unknown error`);
            }
            return new Set([end]);
        }
    });
}
/**
 * Main function to execute the script.
 */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const start = argv.start; // Get the start page from command-line arguments
        const end = argv.end; // Get the end page from command-line arguments
        if (yield checkPages(start, end)) { // Check if the pages are valid
            const endSet = yield redirected(end); // Get the set of possible end URLs
            const path = yield findShortestPath(start, endSet); // Find the shortest path
            if (path) {
                console.log(path); // Log the path
            }
            else {
                console.log('No path found!');
            }
        }
    });
}
const startTime = Date.now(); // Record the start time
main().then(() => {
    const endTime = Date.now(); // Record the end time
    const totalTime = (endTime - startTime) / 1000; // Calculate the total execution time
    console.log(`Execution Time: ${Math.floor(totalTime / 60)}m ${(totalTime % 60).toFixed(3)}s`);
});
