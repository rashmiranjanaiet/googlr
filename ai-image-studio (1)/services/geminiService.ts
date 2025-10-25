
import { GoogleGenAI, Modality } from "@google/genai";
import type { AspectRatio, GroundingSource } from '../types';

// FIX: Per coding guidelines, API key must be from process.env.API_KEY. This also fixes the TypeScript error.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    // In a deployed environment, this error is less likely to be seen in the console,
    // but it's good practice for development.
    // We'll add a user-facing error message in the UI layer.
    console.error("API_KEY environment variable not set");
}

// Initialize AI instance only if API_KEY is available.
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const checkApiKey = () => {
    if (!ai) {
        throw new Error("API Key is missing. Please configure your environment variables.");
    }
};

export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<{ base64Image: string; mimeType: string; }> => {
    checkApiKey();
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const image = response.generatedImages[0];
            return {
                base64Image: image.image.imageBytes,
                mimeType: image.image.mimeType
            };
        } else {
            throw new Error("No images were generated.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image. Please try again.");
    }
};

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

export const editImage = async (prompt: string, imageFile: File): Promise<{ base64Image: string, mimeType: string }> => {
    checkApiKey();
    try {
        const imagePart = await fileToGenerativePart(imageFile);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    imagePart,
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return {
                    base64Image: part.inlineData.data,
                    mimeType: part.inlineData.mimeType,
                };
            }
        }
        throw new Error("No edited image was returned.");

    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit image. Please try again.");
    }
};


export const getPromptIdeas = async (topic: string): Promise<{ suggestion: string, sources: GroundingSource[] }> => {
    checkApiKey();
    try {
        const fullPrompt = `Generate a single, highly detailed and creative image generation prompt based on the topic: "${topic}". The prompt should be descriptive and imaginative, suitable for an AI image generator.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const suggestion = response.text;
        const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        const sources: GroundingSource[] = rawChunks
            .map((chunk: any) => ({
                uri: chunk.web?.uri || '',
                title: chunk.web?.title || '',
            }))
            .filter((source: GroundingSource) => source.uri && source.title);

        return { suggestion, sources };
    } catch (error) {
        console.error("Error getting prompt ideas:", error);
        throw new Error("Failed to get prompt ideas. Please try again.");
    }
};