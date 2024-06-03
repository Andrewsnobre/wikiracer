import { getLinks } from '../utils/getLinks';
import axios from 'axios';

// Mock axios function
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getLinks', () => {
    /**
     * Test case for returning a list of Wikipedia links.
     * @async
     * @returns {Promise<void>}
     */
    it('should return a list of Wikipedia links', async () => {
        const pageHtml = `
            <html>
                <body>
                    <p>
                        <a href="/wiki/JavaScript">JavaScript</a>
                        <a href="/wiki/TypeScript">TypeScript</a>
                    </p>
                </body>
            </html>
        `;
        // Mock axios get response with HTML containing Wikipedia links
        mockedAxios.get.mockResolvedValue({ data: pageHtml });

        const links = await getLinks('https://en.wikipedia.org/wiki/TestPage');
        expect(links).toEqual([
            'https://en.wikipedia.org/wiki/JavaScript',
            'https://en.wikipedia.org/wiki/TypeScript'
        ]);
    });

    /**
     * Test case for returning an empty list if the request fails.
     * @async
     * @returns {Promise<void>}
     */
    it('should return an empty list if request fails', async () => {
        // Mock axios get response to throw an error
        mockedAxios.get.mockRejectedValue(new Error('Network error'));

        const links = await getLinks('https://en.wikipedia.org/wiki/TestPage');
        expect(links).toEqual([]);
    });
});
