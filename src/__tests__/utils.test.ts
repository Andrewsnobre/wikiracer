import { findShortestPath, findFirstPath, getLinks, checkPages, redirected } from '../utils';
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

        it('should return an empty array if no links are found', async () => {
            const page = 'https://en.wikipedia.org/wiki/Empty_Page';
            const html = `<html><body><p>No links here!</p></body></html>`;
            mockedAxios.get.mockResolvedValue({ data: html });

            const links = await getLinks(page);

            expect(links).toEqual([]);
        });

        it('should handle errors and return an empty array', async () => {
            const page = 'https://en.wikipedia.org/wiki/Error_Page';
            mockedAxios.get.mockRejectedValue(new Error('Network Error'));

            const links = await getLinks(page);

            expect(links).toEqual([]);
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

        it('should return true for valid Wikipedia pages in the same language', async () => {
            const start = "https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy";
            const end = "https://en.wikipedia.org/wiki/Wehrmacht";
            const html = `<html><body><p><a href="/wiki/Link1">Link1</a></p></body></html>`;
            
            mockedAxios.get.mockImplementation((url) => {
                if (url === start || url === end) {
                    return Promise.resolve({ status: 200, data: html });
                }
                return Promise.reject(new Error('Page not found'));
            });

            const result = await checkPages(start, end);

            expect(result).toBe(true);
        });

        it('should return false if pages are in different languages', async () => {
            const start = 'https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy';
            const end = 'https://es.wikipedia.org/wiki/Wehrmacht';
            mockedAxios.get.mockResolvedValue({ status: 200 });

            const result = await checkPages(start, end);

            expect(result).toBe(false);
        });

        it('should return false if start page has no links', async () => {
            const start = 'https://en.wikipedia.org/wiki/Empty_Page';
            const end = 'https://en.wikipedia.org/wiki/Wehrmacht';
            const html = `<html><body><p>No links here!</p></body></html>`;
            mockedAxios.get.mockImplementation((url) => {
                if (url === start) {
                    return Promise.resolve({ data: html });
                }
                return Promise.resolve({ status: 200 });
            });

            const result = await checkPages(start, end);

            expect(result).toBe(false);
        });

        it('should return false if end page is an orphan page', async () => {
            const start = 'https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy';
            const end = 'https://en.wikipedia.org/wiki/Wehrmacht';
            const orphanHtml = `<html><body><table class="metadata plainlinks ambox ambox-style ambox-Orphan"></table></body></html>`;
            mockedAxios.get.mockImplementation((url) => {
                if (url === end) {
                    return Promise.resolve({ data: orphanHtml });
                }
                return Promise.resolve({ status: 200 });
            });

            const result = await checkPages(start, end);

            expect(result).toBe(false);
        });

        it('should return false if the response status is not 200', async () => {
            const start = 'https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy';
            const end = 'https://en.wikipedia.org/wiki/Wehrmacht';
            mockedAxios.get.mockResolvedValue({ status: 404 });

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

        it('should handle errors gracefully', async () => {
            const end = 'https://en.wikipedia.org/wiki/Error_Page';
            mockedAxios.get.mockRejectedValue(new Error('Network Error'));

            const result = await redirected(end);

            expect(result).toEqual(new Set([end]));
        });
    });

    describe('findShortestPath', () => {
        it('should find the shortest path between two Wikipedia pages', async () => {
            const start = 'https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy';
            const endSet = new Set(['https://en.wikipedia.org/wiki/Wehrmacht']);
            const html1 = `<html><body><p><a href="/wiki/Link1">Link1</a></p></body></html>`;
            const html2 = `<html><body><p><a href="/wiki/Wehrmacht">Wehrmacht</a></p></body></html>`;

            mockedAxios.get.mockImplementation((url) => {
                if (url === start) {
                    return Promise.resolve({ data: html1 });
                } else if (url === 'https://en.wikipedia.org/wiki/Link1') {
                    return Promise.resolve({ data: html2 });
                }
                return Promise.resolve({ status: 200 });
            });

            const path = await findShortestPath(start, endSet);

            expect(path).toEqual([
                'https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy',
                'https://en.wikipedia.org/wiki/Link1',
                'https://en.wikipedia.org/wiki/Wehrmacht'
            ]);
        });

        it('should return null if no path is found', async () => {
            const start = 'https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy';
            const endSet = new Set(['https://en.wikipedia.org/wiki/Wehrmacht']);
            const html1 = `<html><body><p><a href="/wiki/Link1">Link1</a></p></body></html>`;
            const html2 = `<html><body><p>No relevant links</p></body></html>`;

            mockedAxios.get.mockImplementation((url) => {
                if (url === start) {
                    return Promise.resolve({ data: html1 });
                } else if (url === 'https://en.wikipedia.org/wiki/Link1') {
                    return Promise.resolve({ data: html2 });
                }
                return Promise.resolve({ status: 200 });
            });

            const path = await findShortestPath(start, endSet);

            expect(path).toBeNull();
        });

        it('should handle visited pages correctly', async () => {
            const start = 'https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy';
            const endSet = new Set(['https://en.wikipedia.org/wiki/Wehrmacht']);
            const html1 = `<html><body><p><a href="/wiki/Link1">Link1</a></p></body></html>`;
            const html2 = `<html><body><p><a href="/wiki/Wehrmacht">Wehrmacht</a></p></body></html>`;

            mockedAxios.get.mockImplementation((url) => {
                if (url === start) {
                    return Promise.resolve({ data: html1 });
                } else if (url === 'https://en.wikipedia.org/wiki/Link1') {
                    return Promise.resolve({ data: html2 });
                }
                return Promise.resolve({ status: 200 });
            });

            const path = await findShortestPath(start, endSet);

            expect(path).toEqual([
                'https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy',
                'https://en.wikipedia.org/wiki/Link1',
                'https://en.wikipedia.org/wiki/Wehrmacht'
            ]);
        });

        it('should handle errors gracefully', async () => {
            const start = 'https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy';
            const endSet = new Set(['https://en.wikipedia.org/wiki/Wehrmacht']);
            mockedAxios.get.mockRejectedValue(new Error('Network Error'));

            const path = await findShortestPath(start, endSet);

            expect(path).toBeNull();
        });
    });

    describe('findFirstPath', () => {
        it('should find the first path between two Wikipedia pages', async () => {
            const start = 'https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy';
            const endSet = new Set(['https://en.wikipedia.org/wiki/Wehrmacht']);
            const html1 = `<html><body><p><a href="/wiki/Link1">Link1</a></p></body></html>`;
            const html2 = `<html><body><p><a href="/wiki/Wehrmacht">Wehrmacht</a></p></body></html>`;

            mockedAxios.get.mockImplementation((url) => {
                if (url === start) {
                    return Promise.resolve({ data: html1 });
                } else if (url === 'https://en.wikipedia.org/wiki/Link1') {
                    return Promise.resolve({ data: html2 });
                }
                return Promise.resolve({ status: 200 });
            });

            const path = await findFirstPath(start, endSet);

            expect(path).toEqual([
                'https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy',
                'https://en.wikipedia.org/wiki/Link1',
                'https://en.wikipedia.org/wiki/Wehrmacht'
            ]);
        });

        it('should return null if no path is found', async () => {
            const start = 'https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy';
            const endSet = new Set(['https://en.wikipedia.org/wiki/Wehrmacht']);
            const html1 = `<html><body><p><a href="/wiki/Link1">Link1</a></p></body></html>`;
            const html2 = `<html><body><p>No relevant links</p></body></html>`;

            mockedAxios.get.mockImplementation((url) => {
                if (url === start) {
                    return Promise.resolve({ data: html1 });
                } else if (url === 'https://en.wikipedia.org/wiki/Link1') {
                    return Promise.resolve({ data: html2 });
                }
                return Promise.resolve({ status: 200 });
            });

            const path = await findFirstPath(start, endSet);

            expect(path).toBeNull();
        });

        it('should handle visited pages correctly', async () => {
            const start = 'https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy';
            const endSet = new Set(['https://en.wikipedia.org/wiki/Wehrmacht']);
            const html1 = `<html><body><p><a href="/wiki/Link1">Link1</a></p></body></html>`;
            const html2 = `<html><body><p><a href="/wiki/Wehrmacht">Wehrmacht</a></p></body></html>`;

            mockedAxios.get.mockImplementation((url) => {
                if (url === start) {
                    return Promise.resolve({ data: html1 });
                } else if (url === 'https://en.wikipedia.org/wiki/Link1') {
                    return Promise.resolve({ data: html2 });
                }
                return Promise.resolve({ status: 200 });
            });

            const path = await findFirstPath(start, endSet);

            expect(path).toEqual([
                'https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy',
                'https://en.wikipedia.org/wiki/Link1',
                'https://en.wikipedia.org/wiki/Wehrmacht'
            ]);
        });

        it('should handle errors gracefully', async () => {
            const start = 'https://en.wikipedia.org/wiki/Battle_of_Cr%C3%A9cy';
            const endSet = new Set(['https://en.wikipedia.org/wiki/Wehrmacht']);
            mockedAxios.get.mockRejectedValue(new Error('Network Error'));

            const path = await findFirstPath(start, endSet);

            expect(path).toBeNull();
        });
    });
});
