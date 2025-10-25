
import React from 'react';
import type { ImageResult } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { EditIcon } from './icons/EditIcon';

interface ImageCardProps {
    image: ImageResult;
    onStartEdit: (image: ImageResult) => void;
    isMainDisplay?: boolean;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onStartEdit, isMainDisplay = false }) => {
    
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = image.src;
        link.download = `${image.prompt.substring(0, 30).replace(/\s/g, '_')}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={`relative group overflow-hidden rounded-lg bg-base-300 animate-fade-in ${isMainDisplay ? 'w-full' : 'aspect-square'}`}>
            <img src={image.src} alt={image.prompt} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex flex-col justify-end p-4">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <p className={`text-white text-sm ${isMainDisplay ? 'md:text-base' : 'text-xs'} mb-2`}>{image.prompt}</p>
                     <div className="flex gap-2">
                        <button onClick={handleDownload} className="p-2 bg-brand-primary/80 hover:bg-brand-primary rounded-full text-white backdrop-blur-sm">
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                         <button onClick={() => onStartEdit(image)} className="p-2 bg-brand-primary/80 hover:bg-brand-primary rounded-full text-white backdrop-blur-sm">
                            <EditIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
