'use client';

import React, { useState, useRef } from 'react';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { CardPreview } from '@/components/CardPreview';
import { BackgroundSelector } from '@/components/BackgroundSelector';
import { exportCanvasToPNG, downloadBlob, type CardData } from '@/lib/cardRenderer';

export default function Home() {
    const [username, setUsername] = useState('');
    const [selectedBackground, setSelectedBackground] = useState('/backgrounds/1.png');
    const [cardData, setCardData] = useState<CardData | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const handleGenerate = async () => {
        if (!username.trim()) return;

        setIsGenerating(true);

        // Clean username (remove @ if present)
        const cleanUsername = username.trim().replace(/^@/, '');

        // Simulate network delay for UX polish
        await new Promise(resolve => setTimeout(resolve, 300));

        const data: CardData = {
            username: cleanUsername,
            backgroundPath: selectedBackground,
        };

        setCardData(data);
        setIsGenerating(false);
    };

    const handleDownload = async () => {
        if (!canvasRef.current) return;

        setIsDownloading(true);
        try {
            const blob = await exportCanvasToPNG(canvasRef.current);
            downloadBlob(blob, `bulk-card-${cardData?.username || 'user'}.png`);
        } catch (err) {
            console.error('Download failed:', err);
            // alert('Failed to download'); // Removed alert to be cleaner
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bulk-bg text-bulk-text font-sans selection:bg-bulk-accent/20">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-bulk-bg/80 backdrop-blur-md border-b border-bulk-border">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/bulk-logo-white.png" alt="BULK" className="h-6" />
                        <span className="text-bulk-muted text-sm border-l border-bulk-border pl-3 ml-1">
                            Card Generator
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="min-h-screen pt-24 pb-12 px-6">
                <div className="w-full max-w-7xl mx-auto space-y-8">

                    {/* Title Section - Above Grid */}
                    <div className="space-y-4 animate-fade-in">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                            Generate Your <span className="text-bulk-accent">BULK Card</span>
                        </h1>
                    </div>

                    {/* Controls + Preview Grid - Aligned */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                        {/* Left Column: Controls */}
                        <div className="space-y-8 animate-fade-in delay-100">
                            <div className="space-y-6 bg-bulk-panel/50 p-6 rounded-xl border border-bulk-border/50">
                                <Input
                                    label="X (Twitter) Username"
                                    placeholder="elonmusk"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={isGenerating}
                                />

                                <BackgroundSelector
                                    selectedPath={selectedBackground}
                                    onSelect={setSelectedBackground}
                                />

                                <div className="pt-2">
                                    <Button
                                        onClick={handleGenerate}
                                        isLoading={isGenerating}
                                        fullWidth
                                    >
                                        GENERATE CARD
                                    </Button>
                                </div>
                            </div>

                            {cardData && (
                                <div className="space-y-4 animate-fade-in">
                                    <Button
                                        onClick={handleDownload}
                                        variant="secondary"
                                        isLoading={isDownloading}
                                        fullWidth
                                    >
                                        DOWNLOAD PNG
                                    </Button>

                                    <a
                                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("hi bulkie ✦ this one's mine! @bulktrade")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center w-full py-4 text-sm font-medium text-bulk-muted hover:text-bulk-text transition-colors uppercase tracking-wider group"
                                    >
                                        Share on X
                                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </a>

                                    <p className="text-xs text-bulk-muted text-center max-w-md mx-auto">
                                        <span className="inline-block w-4 h-4 rounded-full bg-bulk-border text-center leading-4 mr-2 text-[10px]">i</span>
                                        Click &quot;Share on X&quot; to open a pre-filled tweet. You&apos;ll manually upload the downloaded image.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Preview */}
                        <div className="lg:sticky lg:top-32 animate-fade-in delay-200">
                            <CardPreview
                                data={cardData}
                                onCanvasReady={(canvas) => {
                                    canvasRef.current = canvas;
                                }}
                            />
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-8 text-center text-xs text-bulk-muted uppercase tracking-wider border-t border-bulk-border mt-auto relative z-10 bg-bulk-bg/80 backdrop-blur-sm">
                <p>
                    &copy; 2026 BULK.
                    <a
                        href="https://x.com/0xshawtyy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-bulk-text hover:text-bulk-accent transition-colors"
                    >
                        0xshawtyy
                    </a>
                </p>
            </footer>


        </div>
    );
}
