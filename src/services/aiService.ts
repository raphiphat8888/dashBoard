import { AgriData } from './localQueryHandler';

export interface DashboardContext {
    totalIncome: number;
    provincesCount: number;
    topProvinces: { name: string; value: number }[];
    filters: {
        region: string;
        year: string;
        incomeType: string;
    };
}

export interface AIReportDraft {
    summary: string;
    observations: { title: string; desc: string; icon?: string }[];
    recommendation: string;
}

export interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
}

const SYSTEM_PROMPT = `You are an expert economic analyst for the Thailand socio-economic dashboard.
Your task is to analyze the provided dashboard data context and generate a short, professional executive summary formatted strictly as JSON.
The JSON must have the following structure:
{
  "summary": "2-3 sentences summarizing the overall situation.",
  "observations": [
     { "title": "Observation Title 1", "desc": "Detailed description 1" },
     { "title": "Observation Title 2", "desc": "Detailed description 2" },
     { "title": "Observation Title 3", "desc": "Detailed description 3" }
  ],
  "recommendation": "1 sentence with a strict actionable policy recommendation."
}
Do NOT wrap the response in markdown code blocks. Return ONLY valid JSON.
`;

export const generateEconomicReport = async (
    context: DashboardContext,
    language: string = 'en'
): Promise<AIReportDraft> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
        throw new Error('API Key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file.');
    }

    const userContext = `
Language required for response: ${language === 'th' ? 'Thai' : 'English'}
Current Dashboard Filters:
- Region: ${context.filters.region}
- Year: ${context.filters.year}
- Segment: ${context.filters.incomeType}

Statistics:
- Total Monitored Income: ฿${context.totalIncome.toLocaleString()}
- Total Provinces Monitored: ${context.provincesCount}

Top Performing Provinces by Income:
${context.topProvinces.map((p, i) => `${i + 1}. ${p.name}: ฿${p.value.toLocaleString()}`).join('\n')}

Based on the data above, generate the JSON executive report. Make sure your observations make logical sense based on the provided numbers.`;

    const cleanApiKey = apiKey.trim();

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${cleanApiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: SYSTEM_PROMPT }]
                },
                contents: [
                    {
                        parts: [{ text: userContext }]
                    }
                ],
                generationConfig: {
                    temperature: 0.2,
                    response_mime_type: "application/json"
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API Error:', errorData);
            throw new Error(errorData.error?.message || 'Failed to fetch insights from AI');
        }

        const data = await response.json();
        const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!resultText) {
            throw new Error('No valid response from AI');
        }

        const report: AIReportDraft = JSON.parse(resultText);
        return report;
    } catch (error) {
        console.error('Error generating AI report:', error);
        throw error;
    }
};

export const askAIQuestion = async (
    question: string,
    reportContext: AIReportDraft | null,
    chatHistory: ChatMessage[],
    dataset: any[],
    language: string = 'en',
    agriData?: AgriData[]
): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
        throw new Error('API Key is missing.');
    }

    const cleanApiKey = apiKey.trim();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${cleanApiKey}`;

    let contextString = '';
    if (reportContext) {
        contextString = `\nContext (Dashboard Summary):\n${reportContext.summary}\nRecommendations:\n${reportContext.recommendation}\nObservations:\n${reportContext.observations.map(o => o.title + ': ' + o.desc).join('\n')}`;
    }

    // Build compact agriculture summary string (~750 tokens total)
    let agriString = '';
    if (agriData && agriData.length > 0) {
        const agriSummary = agriData
            .sort((a, b) => b.farmingHouseholds - a.farmingHouseholds)
            .map(d => `${d.province}|${d.farmingHouseholds}|${d.avgDebt}`)
            .join(';');
        agriString = `\n\nAgriculture Data by Province (Province|FarmingHouseholds|AvgDebt฿):\n${agriSummary}`;
    }

    const systemPrompt = `You are an expert economic planner and manager for Thailand. You have deep knowledge of household income and debt distribution.
The user is asking a question about the dashboard data. Answer concisely and professionally.
You MUST base your statistical answers strictly on the provided context and dataset. Do NOT make up numbers or statistics.
Respond in ${language === 'th' ? 'Thai' : 'English'}.

${contextString}

Active Dashboard Dataset Context (P = Province, I = Avg Monthly Income, D = Avg Monthly Debt):
${JSON.stringify(dataset)}${agriString}`;

    // Format chat history for Gemini API
    const contents = chatHistory.map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    // Append the new question
    contents.push({
        role: 'user',
        parts: [{ text: question }]
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents,
                generationConfig: { temperature: 0.3 }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 429) {
                throw new Error('Rate limit exceeded (Too many requests). Please wait a minute before asking another question.');
            }
            throw new Error(errorData.error?.message || 'Failed to get answer from AI');
        }

        const data = await response.json();
        const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!resultText) {
            throw new Error('No valid response from AI');
        }

        return resultText.trim();
    } catch (error) {
        console.error('Error in chat AI:', error);
        throw error;
    }
};
