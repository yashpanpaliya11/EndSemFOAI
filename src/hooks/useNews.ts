import { useState, useEffect } from 'react';
import { fetchNews, Article } from '../services/newsService';

export const useNews = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState("technology");
    const [searchQuery, setSearchQuery] = useState("");

    const loadNews = async () => {
        setLoading(true);
        try {
            const data = await fetchNews(category);
            setArticles(data || []);
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNews();
    }, [category]);

    const filteredArticles = articles.filter(a => {
       if (!searchQuery) return true;
       const q = searchQuery.toLowerCase();
       return a.title?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q) || a.source?.name?.toLowerCase().includes(q);
    });

    return { 
        articles: filteredArticles, 
        loading, 
        category, 
        setCategory, 
        searchQuery, 
        setSearchQuery,
        refreshNews: loadNews 
    };
};
