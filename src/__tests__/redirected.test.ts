import { redirected } from '../utils/redirected';
import axios from 'axios';

// Mock axios function
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('redirected', () => {
    /**
     * Test case for returning a set with the original and redirected URLs.
     * @async
     * @returns {Promise<void>}
     */
    it('should return a set with the original and redirected URLs', async () => {
        const pageHtml = `
            <html>
                <body>
                    <h1>Test_Page</h1>
                </body>
            </html>
        `;
        // Mock axios get response with HTML containing redirected URL
        mockedAxios.get.mockResolvedValue({ data: pageHtml });

        const end = 'https://en.wikipedia.org/wiki/TestPage';
        const result = await redirected(end);

        expect(result).toEqual(new Set([
            'https://en.wikipedia.org/wiki/TestPage',
            'https://en.wikipedia.org/wiki/Test_Page'
        ]));
    });

    /**
     * Test case for returning a set with only the original URL if the request fails.
     * @async
     * @returns {Promise<void>}
     */
    it('should return a set with only the original URL if request fails', async () => {
        // Mock axios get response to throw an error
        mockedAxios.get.mockRejectedValue(new Error('Network error'));

        const end = 'https://en.wikipedia.org/wiki/TestPage';
        const result = await redirected(end);

        expect(result).toEqual(new Set(['https://en.wikipedia.org/wiki/TestPage']));
    });
});
