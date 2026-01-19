'use client';

import React, { useEffect, useRef, useState } from 'react';
import { renderCardToCanvas, type CardData } from '@/lib/cardRenderer';

interface CardPreviewProps {
    data: CardData | null;
    onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export const CardPreview: React.FC<CardPreviewProps> = ({ data, onCanvasReady }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isRendering, setIsRendering] = useState(false);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

    useEffect(() => {
        const renderCard = async () => {
            if (!data || !canvasRef.current) return;

            setIsRendering(true);
            try {
                await renderCardToCanvas(canvasRef.current, data);
                if (onCanvasReady) {
                    onCanvasReady(canvasRef.current);
                }
            } catch (error) {
                console.error('Failed to render card:', error);
            } finally {
                setIsRendering(false);
            }
        };

        renderCard();
    }, [data, onCanvasReady]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current || !data) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -8; // dikey eğim
        const rotateY = ((x - centerX) / centerX) * 10; // yatay eğim

        setRotation({ x: rotateX, y: rotateY });

        // Track mouse percent for gradient
        setMousePos({
            x: (x / rect.width) * 100,
            y: (y / rect.height) * 100
        });
    };

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 0 });
        // Optional: Reset mousePos to center or fade out
    };

    return (
        <div className="border border-bulk-border bg-bulk-panel p-6">
            <div
                ref={containerRef}
                className="relative w-full aspect-[1200/630] bg-bulk-bg overflow-hidden group"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ perspective: '1000px' }}
            >
                {!data ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 mx-auto border-2 border-bulk-border rounded-full flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-bulk-muted"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                            <p className="text-sm text-bulk-muted uppercase tracking-wide">
                                Enter username to preview
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div
                            className="absolute inset-0 will-change-transform transition-transform duration-150 flex items-center justify-center"
                            style={{
                                transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                                transformStyle: 'preserve-3d',
                            }}
                        >
                            <canvas
                                ref={canvasRef}
                                className="max-w-full max-h-full object-contain"
                                style={{ imageRendering: 'crisp-edges' }}
                            />
                            {/* Option A: Subtle Border Shimmer (UI Overlay) */}
                            <div
                                className="absolute inset-0 border-2 border-bulk-accent opacity-0 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none rounded-lg"
                                style={{ boxShadow: '0 0 15px rgba(19, 149, 114, 0.15)' }}
                            />

                            {/* Holographic Foil Overlay (Premium Polish) */}
                            <div
                                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"
                                style={{
                                    background: `linear-gradient(115deg, transparent 30%, rgba(100, 200, 255, 0.08) 45%, rgba(200, 230, 255, 0.12) 50%, rgba(100, 255, 200, 0.08) 55%, transparent 70%)`,
                                    backgroundSize: '200% 200%',
                                    backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                                    mixBlendMode: 'overlay',
                                    zIndex: 10
                                }}
                            />
                        </div>

                        {isRendering && (
                            <div className="absolute inset-0 bg-bulk-bg/80 flex items-center justify-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-bulk-accent border-t-transparent rounded-full animate-spin" />
                                    <span className="text-sm text-bulk-muted uppercase tracking-wide">
                                        Rendering...
                                    </span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-bulk-muted">
                <p className="text-xs text-bulk-muted uppercase tracking-wide text-center">
                    {data ? 'Live Preview • 1200×630px' : 'Preview • 1200×630px'}
                </p>
            </div>
        </div>

    );
};
