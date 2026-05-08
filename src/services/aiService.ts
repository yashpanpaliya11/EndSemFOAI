import { GoogleGenAI } from '@google/genai';

interface SystemData {
    issLoc?: { lat: string; lon: string };
    issSpeed?: number;
    astros?: number;
    newsCount?: number;
    articles?: {
        title: string;
        source: string;
        description: string;
        category: string;
        publishedAt: string;
    }[];
}

export const generateAiResponse = async (userPrompt: string, dashboardData: SystemData): Promise<string> => {
    
    // Strict prompt injection protection and context limitation
    const contextPrompt = `You are an AI assistant for the ISS Live Tracker & News Dashboard.
You STRICTLY ONLY answer questions based on the following real-time dashboard data. 
Do not use outside knowledge. Do not guess. If you don't know the answer based on the data provided, say "I don't have that information in my current dashboard data."

REAL-TIME DATA:
- ISS Location: Latitude ${dashboardData.issLoc?.lat || 'unknown'}, Longitude ${dashboardData.issLoc?.lon || 'unknown'}
- ISS Speed: ${dashboardData.issSpeed ? dashboardData.issSpeed.toFixed(2) : 'unknown'} km/h
- Number of Astronauts currently in space: ${dashboardData.astros || 'unknown'}
- Tracked news articles count: ${dashboardData.newsCount || 'unknown'}

Latest Dashboard News:
${dashboardData.articles ? dashboardData.articles.map((a, i) => `
${i + 1}. Title: ${a.title}
   Source: ${a.source}
   Summary: ${a.description}
   Category: ${a.category}
   Published: ${a.publishedAt}
`).join('') : 'No news articles available.'}

USER QUESTION: ${userPrompt}`;

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
         return "Please configure the Gemini API variable. Currently running with mock data. \n\n" + 
                `Based on dashboard, ISS Speed is ${dashboardData.issSpeed?.toFixed(0)} km/h with ${dashboardData.astros} astronauts. The ISS is currently at latitude ${dashboardData.issLoc?.lat}, longitude ${dashboardData.issLoc?.lon}.`;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contextPrompt,
             config: {
                temperature: 0.1,
            }
        });

        if (response.text) {
             return response.text.trim();
        }
        
        return "I could not generate an answer at this time.";
    } catch (error: any) {
        console.error("AI Error:", error);
        return "An unexpected error occurred while communicating with the AI model. " + (error?.message || 'Unknown error');
    }
}

