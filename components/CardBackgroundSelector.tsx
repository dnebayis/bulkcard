'use client';

import React, { useState } from 'react';

interface CardBackgroundSelectorProps {
    selectedPath: string | null;
    onSelect: (path: string | null) => void;
}

const CARD_BACKGROUNDS = [
    '/card-backgrounds/1.jpg',
    '/card-backgrounds/2.jpg',
    '/card-backgrounds/3.jpg',
    '/card-backgrounds/4.jpg',
    '/card-backgrounds/5.jpg',
    '/card-backgrounds/6.png',
    '/card-backgrounds/7.jpg',
];

export const CardBackgroundSelector: React.FC<CardBackgroundSelectorProps> = ({ selectedPath, onSelect }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Show all backgrounds by default
    const visibleBackgrounds = CARD_BACKGROUNDS;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-bulk-muted uppercase tracking-wider">
                    Card Background (Optional)
                </label>
            </div>

            <div className="flex flex-wrap gap-2">
                {/* None Option */}
                <button
                    onClick={() => onSelect(null)}
                    className={`
                        px-4 py-2 text-sm font-medium rounded-md border-2 transition-all duration-200
                        ${selectedPath === null
                            ? 'border-bulk-accent bg-bulk-accent/10 text-bulk-accent'
                            : 'border-bulk-border text-bulk-muted hover:border-bulk-muted hover:text-bulk-text'}
                    `}
                >
                    None
                </button>

                {/* Numbered Background Options */}
                {visibleBackgrounds.map((bgPath, index) => {
                    const isSelected = selectedPath === bgPath;
                    return (
                        <button
                            key={index}
                            onClick={() => onSelect(bgPath)}
                            className={`
                                px-4 py-2 text-sm font-medium rounded-md border-2 transition-all duration-200
                                ${isSelected
                                    ? 'border-bulk-accent bg-bulk-accent/10 text-bulk-accent'
                                    : 'border-bulk-border text-bulk-muted hover:border-bulk-muted hover:text-bulk-text'}
                            `}
                        >
                            {index + 1}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
