
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { PromptForm } from './components/PromptForm';
import { ImageCard } from './components/ImageCard';
import { History } from './components/History';
import { Loader } from './components/Loader';
import { generateImage, editImage, getPromptIdeas } from './services/geminiService';
import type { ImageResult, AspectRatio, GroundingSource } from './types';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentImage, setCurrentImage] = useState<ImageResult | null>(null);
    const [history, setHistory] = useState<ImageResult[]>([]);
    const [mode, setMode] = useState<'generate' | 'edit'>('generate');
    const [editFile, setEditFile] = useState<File | null>(null);
    
    const [promptIdeas, setPromptIdeas] = useState<{ suggestion: string, sources: GroundingSource[] } | null>(null);
    const [isThinking, setIsThinking] = useState(false);

    const handleGenerate = useCallback(async (prompt: string, aspectRatio: AspectRatio) => {
        setIsLoading(true);
        setError(null);
        setPromptIdeas(null);
        try {
            const { base64Image, mimeType } = await generateImage(prompt, aspectRatio);
            const newImage: ImageResult = {
                id: Date.now().toString(),
                src: `data:${mimeType};base64,${base64Image}`,
                prompt,
                mimeType,
            };
            setCurrentImage(newImage);
            setHistory(prev => [newImage, ...prev]);
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleEdit = useCallback(async (prompt: string) => {
        if (!editFile) {
            setError("No image selected for editing.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const { base64Image, mimeType } = await editImage(prompt, editFile);
             const newImage: ImageResult = {
                id: Date.now().toString(),
                src: `data:${mimeType};base64,${base64Image}`,
                prompt: `Edit: "${prompt}"`,
                mimeType,
            };
            setCurrentImage(newImage);
            setHistory(prev => [newImage, ...prev]);
            setMode('generate');
            setEditFile(null);
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [editFile]);
    
    const handleGetPromptIdeas = useCallback(async (topic: string) => {
        setIsThinking(true);
        setError(null);
        setPromptIdeas(null);
        try {
            const ideas = await getPromptIdeas(topic);
            setPromptIdeas(ideas);
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred.');
        } finally {
            setIsThinking(false);
        }
    }, []);

    const startEditing = useCallback((image: ImageResult, file: File) => {
        setMode('edit');
        setCurrentImage(image);
        setEditFile(file);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const cancelEdit = useCallback(() => {
        setMode('generate');
        setEditFile(null);
        // Do not clear currentImage to allow user to see what they were editing
    }, []);
    
    const dataURLtoFile = (dataurl: string, filename: string): File => {
        const arr = dataurl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch) {
            throw new Error("Invalid data URL");
        }
        const mime = mimeMatch[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
    }

    return (
        <div className="min-h-screen bg-base-100 text-text-primary font-sans">
            <main className="container mx-auto p-4 lg:p-8">
                <Header />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
                    <div className="lg:col-span-4">
                         <PromptForm
                            onGenerate={handleGenerate}
                            onEdit={handleEdit}
                            onGetIdeas={handleGetPromptIdeas}
                            mode={mode}
                            isLoading={isLoading || isThinking}
                            promptIdeas={promptIdeas}
                            cancelEdit={cancelEdit}
                            setPromptIdeas={setPromptIdeas}
                        />
                    </div>
                    <div className="lg:col-span-8">
                        <div className="bg-base-200 p-4 rounded-2xl shadow-lg h-full min-h-[400px] lg:min-h-[600px] flex items-center justify-center">
                            {isLoading && <Loader />}
                            {!isLoading && error && (
                                <div className="text-center text-red-400">
                                    <h3 className="text-lg font-bold">Generation Failed</h3>
                                    <p>{error}</p>
                                </div>
                            )}
                            {!isLoading && !error && currentImage && (
                                <ImageCard
                                    image={currentImage}
                                    onStartEdit={(image) => startEditing(image, dataURLtoFile(image.src, 'edit-image.jpg'))}
                                    isMainDisplay={true}
                                />
                            )}
                            {!isLoading && !error && !currentImage && (
                                <div className="text-center text-text-secondary">
                                    <p className="text-lg">Your generated image will appear here.</p>
                                    <p>Let your creativity flow!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {history.length > 0 && <History history={history} onStartEdit={(image) => startEditing(image, dataURLtoFile(image.src, 'edit-history-image.jpg'))} />}
            </main>
        </div>
    );
};

export default App;
