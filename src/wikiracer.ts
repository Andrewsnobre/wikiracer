import { findFirstPath, findShortestPath, checkPages, redirected } from './utils';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Define a type for the command-line arguments
interface Args {
    start: string;
    end: string;
    shortest?: boolean;
}

// Parse command-line arguments for start and end Wikipedia pages
const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 --start <startPage> --end <endPage> [--shortest]')
    .demandOption(['start', 'end'])
    .boolean('shortest')
    .alias('shortest', 'S')
    .describe('shortest', 'Find the shortest path between the pages')
    .argv as Args;

/**
 * Main function to execute the script.
 * It validates the start and end Wikipedia pages, finds the first path or the shortest path between them,
 * and prints the path or an error message if no path is found.
 * 
 * @returns {Promise<void>} - A promise that resolves when the main function completes.
 */
async function main(): Promise<void> {
    const start: string = argv.start;
    const end: string = argv.end;
    const useShortestPath: boolean = argv.shortest || false;

    try {
        console.log(`Checking pages: ${start} and ${end}`);
        if (await checkPages(start, end)) {
            console.log(`Pages are valid and in the same language.`);
            const endSet: Set<string> = await redirected(end);
            console.log(`Finding ${useShortestPath ? 'shortest' : 'first'} path from ${start} to ${end}`);
            
            const path: string[] | null = useShortestPath
                ? await findShortestPath(start, endSet)
                : await findFirstPath(start, endSet);

            if (path) {
                console.log('Path found:', path);
            } else {
                console.log('No path found!');
            }
        } else {
            console.log('Invalid pages or pages in different languages.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

const startTime: number = Date.now();

main().then((): void => {
    const endTime: number = Date.now();
    const totalTime: number = (endTime - startTime) / 1000;
    console.log(`Execution Time: ${Math.floor(totalTime / 60)}m ${(totalTime % 60).toFixed(3)}s`);
});
