
import React, { useState, useEffect } from 'react';
import type { AspectRatio, GroundingSource } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface PromptFormProps {
    onGenerate: (prompt: string, aspectRatio: AspectRatio) => void;
    onEdit: (prompt: string) => void;
    onGetIdeas: (topic: string) => void;
    mode: 'generate' | 'edit';
    isLoading: boolean;
    promptIdeas: { suggestion: string, sources: GroundingSource[] } | null;
    cancelEdit: () => void;
    setPromptIdeas: React.Dispatch<React.SetStateAction<{ suggestion: string, sources: GroundingSource[] } | null>>;
}

const promptTemplates = [
    { name: 'Fantasy', prompt: 'An epic fantasy landscape with a dragon flying over a majestic castle, hyperrealistic, 8k, trending on artstation' },
    { name: 'Cyberpunk', prompt: 'A neon-lit cyberpunk city street at night, with flying cars and holographic ads, Blade Runner style, cinematic lighting' },
    { name: 'Nature', prompt: 'A serene and tranquil forest with sunbeams filtering through the trees, a crystal clear stream flowing, photorealistic' },
    { name: 'Abstract', prompt: 'A vibrant abstract painting with swirling colors and geometric shapes, representing the concept of chaos and order, digital art' },
];

const aspectRatios: { label: string; value: AspectRatio }[] = [
    { label: 'Square (1:1)', value: '1:1' },
    { label: 'Landscape (16:9)', value: '16:9' },
    { label: 'Portrait (9:16)', value: '9:16' },
];


export const PromptForm: React.FC<PromptFormProps> = ({ onGenerate, onEdit, onGetIdeas, mode, isLoading, promptIdeas, cancelEdit, setPromptIdeas }) => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [ideaTopic, setIdeaTopic] = useState('');

    useEffect(() => {
        if (mode === 'generate') {
            setPrompt('');
        }
    }, [mode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'generate') {
            onGenerate(prompt, aspectRatio);
        } else {
            onEdit(prompt);
        }
    };
    
    const handleUseSuggestion = () => {
        if (promptIdeas) {
            setPrompt(promptIdeas.suggestion);
            setPromptIdeas(null);
        }
    }

    return (
        <div className="bg-base-200 p-6 rounded-2xl shadow-lg flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-center text-text-primary">
                {mode === 'generate' ? 'Create Your Vision' : 'Edit Your Image'}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                 <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={mode === 'generate' ? 'e.g., A cute cat astronaut on the moon' : 'e.g., Add a retro filter'}
                    className="w-full p-3 bg-base-300 rounded-lg border-2 border-transparent focus:border-brand-primary focus:ring-brand-primary transition-all duration-300 resize-none h-32"
                    rows={4}
                    disabled={isLoading}
                />

                {mode === 'generate' && (
                    <>
                        <div className="flex flex-wrap gap-2">
                            <span className="text-sm font-medium text-text-secondary w-full mb-1">Quick Start:</span>
                            {promptTemplates.map(t => (
                                <button key={t.name} type="button" onClick={() => setPrompt(t.prompt)} className="px-3 py-1 bg-base-300 hover:bg-brand-primary text-sm rounded-full transition-colors" disabled={isLoading}>
                                    {t.name}
                                </button>
                            ))}
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium text-text-secondary mb-2 block">Aspect Ratio</label>
                            <div className="grid grid-cols-3 gap-2">
                               {aspectRatios.map(ar => (
                                   <button key={ar.value} type="button" onClick={() => setAspectRatio(ar.value)}
                                   className={`px-3 py-2 text-sm rounded-lg transition-colors ${aspectRatio === ar.value ? 'bg-brand-primary text-white font-bold' : 'bg-base-300 hover:bg-base-100'}`} disabled={isLoading}>
                                       {ar.label}
                                   </button>
                               ))}
                            </div>
                        </div>
                    </>
                )}

                <button type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-base-300 disabled:cursor-not-allowed" disabled={isLoading || !prompt}>
                    {isLoading ? 'Processing...' : (mode === 'generate' ? 'Generate' : 'Apply Edit')}
                </button>
                {mode === 'edit' && (
                     <button type="button" onClick={cancelEdit} className="w-full bg-base-300 hover:bg-base-100 text-text-primary font-bold py-3 px-4 rounded-lg transition-all duration-300" disabled={isLoading}>
                        Cancel Edit
                    </button>
                )}
            </form>
            
            {mode === 'generate' && (
                <div className="border-t border-base-300 pt-6 flex flex-col gap-4">
                    <h3 className="text-lg font-semibold text-center text-text-secondary">Need Inspiration?</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={ideaTopic}
                            onChange={(e) => setIdeaTopic(e.target.value)}
                            placeholder="e.g., futuristic cities"
                            className="flex-grow p-3 bg-base-300 rounded-lg border-2 border-transparent focus:border-brand-primary focus:ring-brand-primary transition-all duration-300"
                            disabled={isLoading}
                        />
                        <button onClick={() => onGetIdeas(ideaTopic)} className="bg-brand-secondary hover:bg-brand-primary text-white p-3 rounded-lg disabled:bg-base-300" disabled={isLoading || !ideaTopic}>
                            <SparklesIcon className="w-6 h-6" />
                        </button>
                    </div>
                     {promptIdeas && (
                        <div className="bg-base-300 p-4 rounded-lg animate-fade-in">
                            <p className="text-text-secondary italic">"{promptIdeas.suggestion}"</p>
                            <button onClick={handleUseSuggestion} className="mt-3 text-sm bg-brand-primary text-white px-3 py-1 rounded-md hover:bg-brand-secondary">Use this prompt</button>
                            {promptIdeas.sources.length > 0 && (
                                <div className="mt-3 text-xs">
                                    <p className="font-bold">Sources:</p>
                                    <ul className="list-disc list-inside">
                                        {promptIdeas.sources.slice(0,3).map((source, i) => (
                                            <li key={i}><a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-brand-secondary hover:underline">{source.title}</a></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};
