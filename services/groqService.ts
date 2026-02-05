import Groq from "groq-sdk";
import { PredictionResult, ChatMessage } from "../types";

const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

const searchTavily = async (query: string) => {
    const apiKey = import.meta.env.VITE_TAVILY_API_KEY;
    if (!apiKey) {
        console.warn("Tavily API Key missing. Falling back to AI hallucination.");
        return null;
    }

    try {
        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                api_key: apiKey,
                query: query,
                include_answer: true,
                search_depth: "basic",
                max_results: 5
            })
        });

        if (!response.ok) {
            throw new Error(`Tavily error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Tavily search failed:", error);
        return null;
    }
};

export const analyzeUrlTraffic = async (url: string): Promise<PredictionResult> => {
    // 1. Get Real-Time Data via Tavily
    const searchResult = await searchTavily(`current traffic status outages and popularity of ${url}`);

    let context = "";
    let sources: any[] = [];

    if (searchResult) {
        context = `REAL-TIME DATA FROM SEARCH:\n${JSON.stringify(searchResult.results)}\nTavily Analysis: ${searchResult.answer}\n\n`;
        sources = searchResult.results.map((r: any) => ({ title: r.title, uri: r.url }));
    } else {
        context = "No real-time data available. Rely on your internal knowledge base.";
    }

    // 2. Feed to Groq
    const prompt = `
    ${context}
    
    Analyze the current real-time popularity and traffic of the following URL: ${url}. 
    Find data about its daily/hourly active users, current trending status, or any recent events (like sales, outages, or launches) that would affect traffic.
    Based on this, predict the current number of concurrent users and provide a scaling recommendation.
    Respond strictly in JSON format with the following structure:
    {
      "estimatedUsers": number,
      "explanation": "string",
      "confidence": number,
      "recommendedPods": number
    }`;

    const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        temperature: 0.5,
    });

    const jsonStr = completion.choices[0]?.message?.content || "{}";
    let result;
    try {
        result = JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse JSON", jsonStr);
        result = { estimatedUsers: 0, explanation: "Failed to parse AI response", confidence: 0, recommendedPods: 0 };
    }

    return { ...result, sources };
};

export const getQuickAdvice = async (query: string): Promise<string> => {
    const completion = await groq.chat.completions.create({
        messages: [
            { role: "system", content: "You are Nova AI, a senior Cloud SRE expert. Provide extremely concise, low-latency technical advice." },
            { role: "user", content: query }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        max_tokens: 150
    });

    return completion.choices[0]?.message?.content || "No response received.";
};

export const startComplexChat = async (history: ChatMessage[], prediction: PredictionResult | null) => {
    let dynamicInstruction = "You are Nova AI, a deep-thinking AI Cloud Engineer. You help users design resilient, auto-scaling Kubernetes architectures. Explain your reasoning steps clearly.";

    if (prediction) {
        dynamicInstruction += `\n\nCURRENT CLUSTER CONTEXT:
- Estimated Current Users: ${prediction.estimatedUsers}
- Recommended Pod Count: ${prediction.recommendedPods}
- Analysis Confidence: ${(prediction.confidence * 100).toFixed(0)}%
- AI Logic for current scaling: ${prediction.explanation}

Use these specific metrics when answering user questions about the current state of the cluster.`;
    }

    const formattedHistory = history.map((msg) => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.content
    }));

    return {
        sendMessage: async ({ message }: { message: string }) => {
            const messages = [
                { role: "system", content: dynamicInstruction },
                ...formattedHistory,
                { role: "user", content: message }
            ];

            const completion = await groq.chat.completions.create({
                messages: messages as any,
                model: "llama-3.3-70b-versatile",
            });

            const responseText = completion.choices[0]?.message?.content || "";
            return { text: responseText };
        }
    };
};
