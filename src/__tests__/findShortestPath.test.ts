import { findShortestPath } from '../utils/findShortestPath';
import { getLinks } from '../utils/getLinks';

jest.mock('../utils/getLinks');
const mockedGetLinks = getLinks as jest.MockedFunction<typeof getLinks>;

describe('findShortestPath', () => {
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
        mockedGetLinks.mockReset();
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation((msg) => {
            if (msg === "Processing...please wait" || msg.includes("⚠️  Warning")) {
                return;
            }
            return console.log(msg); // Adicione este retorno para evitar loop
        });
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
    });

    it('should find the shortest path between two Wikipedia pages', async () => {
        mockedGetLinks.mockResolvedValueOnce(['https://en.wikipedia.org/wiki/JavaScript']);
        mockedGetLinks.mockResolvedValueOnce(['https://en.wikipedia.org/wiki/TypeScript']);

        const start = 'https://en.wikipedia.org/wiki/TestPage';
        const endSet = new Set(['https://en.wikipedia.org/wiki/TypeScript']);

        const path = await findShortestPath(start, endSet);
        expect(path).toEqual([
            'https://en.wikipedia.org/wiki/TestPage',
            'https://en.wikipedia.org/wiki/JavaScript',
            'https://en.wikipedia.org/wiki/TypeScript'
        ]);
    });

    it('should return null if no path is found', async () => {
        mockedGetLinks.mockResolvedValueOnce(['https://en.wikipedia.org/wiki/JavaScript']);
        mockedGetLinks.mockResolvedValueOnce([]);

        const start = 'https://en.wikipedia.org/wiki/TestPage';
        const endSet = new Set(['https://en.wikipedia.org/wiki/NonExistentPage']);

        const path = await findShortestPath(start, endSet);
        expect(path).toBeNull();
    });
});
