import { findFirstPath } from '../utils/findFirstPath';
import { getLinks } from '../utils/getLinks';

// Mock getLinks function
jest.mock('../utils/getLinks');
const mockedGetLinks = getLinks as jest.MockedFunction<typeof getLinks>;

describe('findFirstPath', () => {
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
        // Reset mocks before each test
        mockedGetLinks.mockReset();
        // Spy on console.log and implement a custom behavior to avoid infinite loops
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation((msg) => {
            if (msg === "Processing...please wait") {
                return;
            }
            console.log(msg);
        });
    });

    afterEach(() => {
        // Restore console.log after each test
        consoleLogSpy.mockRestore();
    });

    /**
     * Test case for finding the first path between two Wikipedia pages.
     * @async
     * @returns {Promise<void>}
     */
    it('should find the first path between two Wikipedia pages', async () => {
        // Mock getLinks responses for two pages
        mockedGetLinks.mockResolvedValueOnce(['https://en.wikipedia.org/wiki/JavaScript']);
        mockedGetLinks.mockResolvedValueOnce(['https://en.wikipedia.org/wiki/TypeScript']);

        const start = 'https://en.wikipedia.org/wiki/TestPage';
        const endSet = new Set(['https://en.wikipedia.org/wiki/TypeScript']);

        const path = await findFirstPath(start, endSet);
        expect(path).toEqual([
            'https://en.wikipedia.org/wiki/TestPage',
            'https://en.wikipedia.org/wiki/JavaScript',
            'https://en.wikipedia.org/wiki/TypeScript'
        ]);
    });

    /**
     * Test case for returning null if no path is found.
     * @async
     * @returns {Promise<void>}
     */
    it('should return null if no path is found', async () => {
        // Mock getLinks responses with no path to the end page
        mockedGetLinks.mockResolvedValueOnce(['https://en.wikipedia.org/wiki/JavaScript']);
        mockedGetLinks.mockResolvedValueOnce([]);

        const start = 'https://en.wikipedia.org/wiki/TestPage';
        const endSet = new Set(['https://en.wikipedia.org/wiki/NonExistentPage']);

        const path = await findFirstPath(start, endSet);
        expect(path).toBeNull();
    });
});
