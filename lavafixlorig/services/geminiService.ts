import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

// --- Helpers ---

export const getGeminiClient = () => {
    return new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY);
};

// --- Services ---

// 1. Chatbot (Gemini 1.5 Pro) with Search Grounding
export const sendChatMessage = async (history: { role: string, parts: { text: string }[] }[], message: string) => {
    const ai = getGeminiClient();
    const model = ai.getGenerativeModel({
        model: 'gemini-1.5-pro',
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are LavaFix's expert AI technician. Help users diagnose appliance issues, find parts, and offer maintenance advice. Keep answers concise and helpful."
    });

    const chat = model.startChat({
        history: history,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text, grounding };
};

// 2. Video Understanding (Gemini 1.5 Pro)
export const analyzeApplianceVideo = async (base64Video: string, mimeType: string, prompt: string) => {
    const ai = getGeminiClient();
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent([
        { inlineData: { mimeType, data: base64Video } },
        { text: prompt }
    ]);
    const response = await result.response;
    return response.text();
};

// 3. Audio Transcription (Gemini 1.5 Flash)
export const transcribeAudio = async (base64Audio: string, mimeType: string) => {
    const ai = getGeminiClient();
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent([
        { inlineData: { mimeType, data: base64Audio } },
        { text: "Transcribe this audio exactly as spoken." }
    ]);
    const response = await result.response;
    return response.text();
};

// 4. Text to Speech (Gemini 1.5 Flash)
export const generateSpeech = async (text: string) => {
    // Note: Standard Generative AI SDK doesn't have a direct "tts" model yet like this.
    // We would typically use a specialized TTS API or a multimodal output if supported.
    // For now, let's keep it as a placeholder or use a valid flash model.
    const ai = getGeminiClient();
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([text]);
    const response = await result.response;

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
};

// 5. Image Editing (Imagen is usually a separate tool or part of generation)
export const editApplianceImage = async (base64Image: string, prompt: string) => {
    const ai = getGeminiClient();
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent([
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: prompt },
    ]);
    const response = await result.response;

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    return null;
};

// 6. Maps Grounding (Gemini 1.5 Flash)
export const findRepairShops = async (latitude: number, longitude: number, query: string) => {
    const ai = getGeminiClient();
    const model = ai.getGenerativeModel({
        model: "gemini-1.5-flash",
        tools: [{ googleSearch: {} }] // Note: googleMaps tool is handled differently in public SDK
    });
    const result = await model.generateContent(query);
    const response = await result.response;

    return {
        text: response.text(),
        chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
};

// 7. Video Generation (Veo)
export const generateVeoVideo = async (prompt: string, imageBase64?: string) => {
    // Veo is currently in limited preview and might not be in the public @google/genai SDK yet.
    // This is a placeholder for the future implementation.
    console.warn("Video generation is currently in preview.");
    return null;
};

