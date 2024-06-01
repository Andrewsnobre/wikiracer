import { getLinks } from '../utils/getLinks';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getLinks', () => {
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
        mockedAxios.get.mockResolvedValue({ data: pageHtml });

        const links = await getLinks('https://en.wikipedia.org/wiki/TestPage');
        expect(links).toEqual([
            'https://en.wikipedia.org/wiki/JavaScript',
            'https://en.wikipedia.org/wiki/TypeScript'
        ]);
    });

    it('should return an empty list if request fails', async () => {
        mockedAxios.get.mockRejectedValue(new Error('Network error'));

        const links = await getLinks('https://en.wikipedia.org/wiki/TestPage');
        expect(links).toEqual([]);
    });
});
