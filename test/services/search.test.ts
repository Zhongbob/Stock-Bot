import { describe, it, expect, vi } from 'vitest';
import SearchService from '../../src/services/search.service.js';
import yahooFinance from '../../src/lib/yahooFinance.js';

vi.mock('../../src/lib/yahooFinance.js', () => ({
    default: {
        search: vi.fn().mockResolvedValue({
            count: 1,
            totalTime: 42,
            quotes: [
                {
                    symbol: 'GOOGL',
                    quoteType: 'EQUITY',
                    isYahooFinance: true,
                    longname: 'Alphabet Inc.',
                    shortname: 'Alphabet Inc.',
                    exchDisp: 'NASDAQ',
                    sector: 'Communication Services',
                    industry: 'Internet Content & Information',
                },
            ],
            news: [
                {
                    title: 'Google announces new AI features',
                    publisher: 'TechCrunch',
                    link: 'https://techcrunch.com/google-ai',
                    providerPublishTime: new Date('2026-04-07'),
                },
            ],
        }),
    },
}));

describe('Search Service', () => {
    describe('searchByKeyword', () => {
        it('should return a result with type "text" and action "send"', async () => {
            const result = await SearchService.searchByKeyword('GOOGL');

            expect(result.type).toBe('text');
            expect(result.action).toBe('send');
        });

        it('should return raw search data from yahoo finance', async () => {
            const result = await SearchService.searchByKeyword('GOOGL');

            expect(result.raw).toBeDefined();
            expect(result.raw.quotes[0].symbol).toBe('GOOGL');
        });

        it('should return a populated summary with primary quote info', async () => {
            const result = await SearchService.searchByKeyword('GOOGL');

            expect(result.summary).not.toBeNull();
            expect(result.summary?.primary.symbol).toBe('GOOGL');
            expect(result.summary?.primary.company).toBe('Alphabet Inc.');
        });

        it('should return a text function that produces a string', async () => {
            const result = await SearchService.searchByKeyword('GOOGL');

            expect(typeof result.text).toBe('function');
            expect(typeof result.text(true)).toBe('string');
            expect(typeof result.text(false)).toBe('string');
            expect(result.text(true)).toContain('GOOGL');
        });

        it('should return summary as null and throw when text() is called if no results are found', async () => {
            vi.mocked(yahooFinance.search).mockResolvedValueOnce({
                count: 0,
                totalTime: 10,
                quotes: [],
                news: [],
            });

            const result = await SearchService.searchByKeyword('UNKNOWNSYMBOL123');

            expect(result.type).toBe('text');
            expect(result.action).toBe('send');
            expect(result.raw.quotes).toHaveLength(0);
            expect(result.summary).toBeNull();
            expect(() => result.text()).toThrow();
        });
    });
})
