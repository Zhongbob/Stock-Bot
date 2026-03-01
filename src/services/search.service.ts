import yahooFinance from "../lib/yahooFinance.js"
import type { SearchResult } from "yahoo-finance2/modules/search";
import type { SendTextResult } from "../types/telegramResults.js";
import telegramifyMarkdown from "telegramify-markdown";
import type { Quote } from "yahoo-finance2/modules/quote";

interface SearchByKeywordResult extends SendTextResult {
    raw: SearchResult;
    summary: ReturnType<typeof SearchService._summarizeYahooSearchResult>;
}
 
const SearchService: {
    _summarizeYahooSearchResult: (data: SearchResult | null) => any;
    _yahooSummaryToText: (summary: any, markdown?: boolean) => string;
    searchByKeyword: (keyword: string) => Promise<SearchByKeywordResult>;
} = {
    _summarizeYahooSearchResult: function (data: SearchResult | null) {
        if (!data?.quotes?.length) {
            return null;
        }

        // Prefer real equities first
        const primaryQuote =
            data.quotes.find(q => q.quoteType === "EQUITY") ??
            data.quotes.find(q => q.isYahooFinance);

        const relatedQuotes = data.quotes
            .filter(q =>
            q.symbol &&
            q.symbol !== primaryQuote?.symbol
            )
            .map(q => ({
            symbol: q.symbol,
            type: q.quoteType,
            name: q.longname || q.shortname
            }));

        const newsSummary = (data.news ?? [])
            .slice(0, 5)
            .map(n => ({
            title: n.title,
            publisher: n.publisher,
            link: n.link,
            publishedAt: n.providerPublishTime
            }));

        return {
            primary: {
            symbol: primaryQuote?.symbol,
            company: primaryQuote?.longname,
            exchange: primaryQuote?.exchDisp,
            sector: primaryQuote?.sector,
            industry: primaryQuote?.industry
            },

            related: relatedQuotes,
            news: newsSummary,

            meta: {
            resultCount: data.count,
            totalTimeMs: data.totalTime
            }
        };
        },
    _yahooSummaryToText: function(summary: 
        ReturnType<typeof SearchService._summarizeYahooSearchResult>,
        markdown = true
    ) {
        if (markdown){
            return `
📈 ${summary.primary.company} (${summary.primary.symbol})
Exchange: ${summary.primary.exchange}
Sector: ${summary.primary.sector}

📰 Latest News:
${summary.news.map(n => `• [${n.title}](${n.link})`).join("\n")}
`
        }
        return `
📈 ${summary.primary.company} (${summary.primary.symbol})
Exchange: ${summary.primary.exchange}
Sector: ${summary.primary.sector}

📰 Latest News:
${summary.news.map(n => `• ${n.title} (${n.link})`).join("\n")}
`
    },
    searchByKeyword: async (keyword: string) => {
        const data = await yahooFinance.search(keyword)
        const summary = SearchService._summarizeYahooSearchResult(data)
        const getSummaryText = (markdown = true) => SearchService._yahooSummaryToText(summary, markdown)
        return {
            type: "text",
            raw: data,
            summary,
            text: getSummaryText
        }
    },
    
}

export default SearchService;