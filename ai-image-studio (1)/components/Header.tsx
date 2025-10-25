
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

export const Header: React.FC = () => {
    return (
        <header className="text-center">
            <div className="inline-flex items-center gap-4">
                <SparklesIcon className="w-10 h-10 text-brand-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary">
                    AI Image Studio
                </h1>
            </div>
            <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
                Craft stunning visuals
            </p>
        </header>
    );
};
