import { checkPages } from '../utils/checkPages';
import axios from 'axios';
import { getLinks } from '../utils/getLinks';

jest.mock('axios');
jest.mock('../utils/getLinks');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGetLinks = getLinks as jest.MockedFunction<typeof getLinks>;

describe('checkPages', () => {
    beforeEach(() => {
        mockedAxios.get.mockReset();
        mockedGetLinks.mockReset();
    });

    it('should return true for valid Wikipedia pages in the same language', async () => {
        mockedAxios.get.mockResolvedValue({ status: 200, data: '<html><body></body></html>' });
        mockedGetLinks.mockResolvedValue(['https://en.wikipedia.org/wiki/JavaScript']);

        const start = 'https://en.wikipedia.org/wiki/TestPage';
        const end = 'https://en.wikipedia.org/wiki/JavaScript';

        const result = await checkPages(start, end);
        expect(result).toBe(true);
    });

    it('should return false for invalid Wikipedia URLs', async () => {
        mockedAxios.get.mockRejectedValue(new Error('Network error'));

        const start = 'https://invalid.wikipedia.org/wiki/InvalidPage';
        const end = 'https://en.wikipedia.org/wiki/JavaScript';

        const result = await checkPages(start, end);
        expect(result).toBe(false);
    });

    it('should return false for pages in different languages', async () => {
        mockedAxios.get.mockResolvedValue({ status: 200 });

        const start = 'https://en.wikipedia.org/wiki/TestPage';
        const end = 'https://fr.wikipedia.org/wiki/JavaScript';

        const result = await checkPages(start, end);
        expect(result).toBe(false);
    });

    it('should return false if the start page has no links', async () => {
        mockedAxios.get.mockResolvedValue({ status: 200, data: '<html></html>' });
        mockedGetLinks.mockResolvedValue([]);

        const start = 'https://en.wikipedia.org/wiki/DeadEndPage';
        const end = 'https://en.wikipedia.org/wiki/JavaScript';

        const result = await checkPages(start, end);
        expect(result).toBe(false);
    });
});
