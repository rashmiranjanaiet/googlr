
import React from 'react';
import type { ImageResult } from '../types';
import { ImageCard } from './ImageCard';

interface HistoryProps {
    history: ImageResult[];
    onStartEdit: (image: ImageResult) => void;
}

export const History: React.FC<HistoryProps> = ({ history, onStartEdit }) => {
    return (
        <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6 text-center">Session History</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {history.map((image) => (
                    <ImageCard key={image.id} image={image} onStartEdit={onStartEdit} />
                ))}
            </div>
        </div>
    );
};
