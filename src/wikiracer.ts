import { findShortestPath, checkPages, redirected } from './utils';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Define a type for the command-line arguments
interface Args {
    start: string;
    end: string;
}

// Parse command-line arguments for start and end Wikipedia pages
const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 --start <startPage> --end <endPage>')
    .demandOption(['start', 'end'])
    .argv as Args;

/**
 * Main function to execute the script.
 * It validates the start and end Wikipedia pages, finds the shortest path between them,
 * and prints the path or an error message if no path is found.
 * 
 * @returns {Promise<void>} A promise that resolves when the main function completes.
 */
async function main(): Promise<void> {
    const start: string = argv.start; // URL of the starting Wikipedia page
    const end: string = argv.end;     // URL of the ending Wikipedia page

    // Check if the provided Wikipedia pages are valid and in the same language
    if (await checkPages(start, end)) {
        const endSet: Set<string> = await redirected(end); // Get the set of possible end URLs after redirection
        const path: string[] | null = await findShortestPath(start, endSet); // Find the shortest path between the pages

        // Print the found path or indicate that no path was found
        if (path) {
            console.log(path);
        } else {
            console.log('No path found!');
        }
    }
}

// Record the start time of the script execution
const startTime: number = Date.now();

// Execute the main function and calculate the total execution time
main().then((): void => {
    const endTime: number = Date.now();
    const totalTime: number = (endTime - startTime) / 1000; // Total time in seconds
    console.log(`Execution Time: ${Math.floor(totalTime / 60)}m ${(totalTime % 60).toFixed(3)}s`);
});
