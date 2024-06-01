import { redirected } from '../utils/redirected';
import axios from 'axios';
import { load } from 'cheerio';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('redirected', () => {
    it('should return a set with the original and redirected URLs', async () => {
        const pageHtml = `
            <html>
                <body>
                    <h1>Test_Page</h1>
                </body>
            </html>
        `;
        mockedAxios.get.mockResolvedValue({ data: pageHtml });

        const end = 'https://en.wikipedia.org/wiki/TestPage';
        const result = await redirected(end);

        expect(result).toEqual(new Set([
            'https://en.wikipedia.org/wiki/TestPage',
            'https://en.wikipedia.org/wiki/Test_Page'
        ]));
    });

    it('should return a set with only the original URL if request fails', async () => {
        mockedAxios.get.mockRejectedValue(new Error('Network error'));

        const end = 'https://en.wikipedia.org/wiki/TestPage';
        const result = await redirected(end);

        expect(result).toEqual(new Set(['https://en.wikipedia.org/wiki/TestPage']));
    });
});
