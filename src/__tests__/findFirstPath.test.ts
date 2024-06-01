import { findFirstPath } from '../utils/findFirstPath';
import { getLinks } from '../utils/getLinks';

jest.mock('../utils/getLinks');
const mockedGetLinks = getLinks as jest.MockedFunction<typeof getLinks>;

describe('findFirstPath', () => {
    it('should find the first path between two Wikipedia pages', async () => {
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

    it('should return null if no path is found', async () => {
        mockedGetLinks.mockResolvedValueOnce(['https://en.wikipedia.org/wiki/JavaScript']);
        mockedGetLinks.mockResolvedValueOnce([]);

        const start = 'https://en.wikipedia.org/wiki/TestPage';
        const endSet = new Set(['https://en.wikipedia.org/wiki/NonExistentPage']);

        const path = await findFirstPath(start, endSet);
        expect(path).toBeNull();
    });
});
