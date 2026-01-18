'use client';

import React from 'react';

interface BackgroundSelectorProps {
    selectedPath: string;
    onSelect: (path: string) => void;
}

const BACKGROUNDS = [
    '/backgrounds/1.png',
    '/backgrounds/2.png',
    '/backgrounds/3.png',
    '/backgrounds/4.png',
    '/backgrounds/5.png',
    '/backgrounds/6.png',
    '/backgrounds/7.png',
    '/backgrounds/8.png',
    '/backgrounds/9.png',
    '/backgrounds/10.png',
    '/backgrounds/11.png',
    '/backgrounds/12.png',
    '/backgrounds/13.png',
    '/backgrounds/14.png',
    '/backgrounds/15.png',
];

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ selectedPath, onSelect }) => {
    return (
        <div className="space-y-3">
            <label className="text-xs font-bold text-bulk-muted uppercase tracking-wider">
                Select Bulkie
            </label>
            <div className="grid grid-cols-5 gap-3">
                {BACKGROUNDS.map((bgPath, index) => {
                    const isSelected = selectedPath === bgPath;
                    return (
                        <button
                            key={index}
                            onClick={() => onSelect(bgPath)}
                            className={`
                relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 group
                ${isSelected
                                    ? 'border-bulk-accent ring-2 ring-bulk-accent/20 scale-105 z-10'
                                    : 'border-bulk-border hover:border-bulk-muted opacity-60 hover:opacity-100'}
              `}
                            aria-label={`Select background ${index + 1}`}
                        >
                            <img
                                src={bgPath}
                                alt={`Background ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {isSelected && (
                                <div className="absolute inset-0 bg-bulk-accent/10 pointer-events-none" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
