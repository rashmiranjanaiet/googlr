
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

export const Loader: React.FC = () => {
    return (
        <div className="text-center flex flex-col items-center justify-center gap-4 text-text-secondary">
            <SparklesIcon className="w-12 h-12 text-brand-primary animate-pulse-fast" />
            <p className="text-lg font-semibold">AI is creating magic...</p>
            <p className="text-sm">This can take a moment. Please be patient.</p>
        </div>
    );
};
