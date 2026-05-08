import axios from 'axios';

export interface Article {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: Article[];
}

const CACHE_KEY = 'news_cache';
const CACHE_TIME = 15 * 60 * 1000; // 15 minutes

const getBaseUrl = () => {
    return window.location.origin;
};

// VITE_NEWS_API_KEY
const apiKey = import.meta.env.VITE_NEWS_API_KEY;

export const fetchNews = async (category = 'technology'): Promise<Article[]> => {
  // Check cache
  const cached = localStorage.getItem(`${CACHE_KEY}_${category}`);
  if (cached) {
    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TIME) {
      return data;
    }
  }

  // If no apikey and we hit NewsAPI, it requires API key.
  // The Vercel proxy we wrote `/api/news` rewrites to `https://newsapi.org/v2/top-headlines`
  // We need to add the apiKey parameter.
  try {
    let url = `${getBaseUrl()}/api/news?country=us&category=${category}`;
    if (apiKey && apiKey !== 'your_api_key') {
      url += `&apiKey=${apiKey}`;
    } else {
        // Fallback to a mock / open API if no API key is provided
        // Just for demo purposes so it doesn't break
        return getMockDocs(category);
    }
    
    const response = await axios.get(url, {
        headers: apiKey ? { 'X-Api-Key': apiKey } : {}
    });

    if (response.data.status === 'ok') {
      const articles = response.data.articles.filter((a: Article) => a.title && a.urlToImage);
      localStorage.setItem(`${CACHE_KEY}_${category}`, JSON.stringify({ timestamp: Date.now(), data: articles }));
      return articles;
    }
    return [];
  } catch (error) {
    console.error('Error fetching news:', error);
    // If API fails, try to return mock docs to keep the UI functioning
    return getMockDocs(category);
  }
};

function getMockDocs(category: string): Article[] {
    return [
        {
            source: { id: null, name: "Space & Tech News" },
            author: "AI Reporter",
            title: `Latest breakthroughs in ${category}`,
            description: `A fascinating new discovery in the field of ${category} has scientists excited about the future possibilities for space exploration.`,
            url: "#",
            urlToImage: `https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop`,
            publishedAt: new Date().toISOString(),
            content: "Content..."
        },
        {
            source: { id: null, name: "Aero Daily" },
            author: "Jane Doe",
            title: `NASA prepares for next generation missions focusing on ${category}`,
            description: `The agency is gearing up for a revolutionary set of missions that will change how we understand the universe.`,
            url: "#",
            urlToImage: `https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop`,
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            content: "Content..."
        },
        {
            source: { id: null, name: "TechCrunch Cosmos" },
            author: "John Smith",
            title: `SpaceX updates trajectory for future cargo runs`,
            description: `Recent tests show improved fuel efficiency and payload capacity for the starship program.`,
            url: "#",
            urlToImage: `https://images.unsplash.com/photo-1541185933-ef7d8ed216da?q=80&w=2070&auto=format&fit=crop`,
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            content: "Content..."
        }
    ];
}
