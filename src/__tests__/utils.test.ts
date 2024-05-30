import { findShortestPath, getLinks, checkPages, redirected } from '../utils';
import axios from 'axios';
import cheerio from 'cheerio';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('utils', () => {
    describe('getLinks', () => {
        it('should fetch and parse links from a Wikipedia page', async () => {
            const page = 'https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy';
            const html = `<html><body><p><a href="/wiki/Link1">Link1</a><a href="/wiki/Link2">Link2</a></p></body></html>`;
            mockedAxios.get.mockResolvedValue({ data: html });

            const links = await getLinks(page);

            expect(links).toEqual([
                'https://en.wikipedia.org/wiki/Link1',
                'https://en.wikipedia.org/wiki/Link2'
            ]);
        });
    });

    describe('checkPages', () => {
        it('should return false for invalid Wikipedia pages', async () => {
            const start = 'https://en.wikipedia.org/wiki/Invalid_Page';
            const end = 'https://en.wikipedia.org/wiki/Wehrmacht';
            mockedAxios.get.mockRejectedValue(new Error('Page not found'));

            const result = await checkPages(start, end);

            expect(result).toBe(false);
        });
    });

    describe('redirected', () => {
        it('should handle redirection for the ending Wikipedia page', async () => {
            const end = 'https://en.wikipedia.org/wiki/Wehrmacht';
            const html = `<html><h1>Wehrmacht</h1></html>`;
            mockedAxios.get.mockResolvedValue({ data: html });

            const result = await redirected(end);

            expect(result).toEqual(new Set([
                'https://en.wikipedia.org/wiki/Wehrmacht',
                'https://en.wikipedia.org/wiki/Wehrmacht'
            ]));
        });
    });
});
