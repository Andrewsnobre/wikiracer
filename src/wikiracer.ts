import { findShortestPath, checkPages, redirected } from './utils';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 --start <startPage> --end <endPage>')
    .demandOption(['start', 'end'])
    .argv as { start: string, end: string };

async function main() {
    const start = argv.start;
    const end = argv.end;

    if (await checkPages(start, end)) {
        const endSet = await redirected(end);
        const path = await findShortestPath(start, endSet);
        if (path) {
            console.log(path);
        } else {
            console.log('No path found!');
        }
    }
}

const startTime = Date.now();
main().then(() => {
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    console.log(`Execution Time: ${Math.floor(totalTime / 60)}m ${(totalTime % 60).toFixed(3)}s`);
});
