'use client';

import React, { useState, useRef } from 'react';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { CardPreview } from '@/components/CardPreview';
import { BackgroundSelector } from '@/components/BackgroundSelector';
import { CardBackgroundSelector } from '@/components/CardBackgroundSelector';
import { exportCanvasToPNG, downloadBlob, type CardData } from '@/lib/cardRenderer';

export default function Home() {
    const [username, setUsername] = useState('');
    const [tagline, setTagline] = useState('hi bulkie!');
    const [selectedBackground, setSelectedBackground] = useState('/backgrounds/1.png');
    const [selectedCardBackground, setSelectedCardBackground] = useState<string | null>('/background.png');
    const [cardData, setCardData] = useState<CardData | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const handleGenerate = async () => {
        if (!username.trim()) return;

        setIsGenerating(true);

        const cleanUsername = username.trim().replace(/^@/, '');

        // Fetch Twitter Display Name via our Proxy API
        let displayName = '';
        try {
            const res = await fetch(`/api/twitter-info?username=${encodeURIComponent(cleanUsername)}`);
            if (res.ok) {
                const json = await res.json();
                displayName = json.name || '';
            }
        } catch (e) {
            console.error('Failed to fetch twitter info:', e);
        }

        console.log('[Generate] Display Name:', displayName);

        const data: CardData = {
            username: cleanUsername,
            displayName: displayName,
            backgroundPath: selectedBackground,
            cardBackgroundPath: selectedCardBackground || undefined,
            tagline: tagline,
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
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-bulk-bg text-bulk-text font-sans selection:bg-bulk-accent/20 relative"
            style={{
                backgroundImage: 'url(/background.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
            }}
        >
            {/* Dark overlay for better text readability */}
            <div className="fixed inset-0 bg-bulk-bg/60 pointer-events-none" />
            <header className="fixed top-0 left-0 right-0 z-50 bg-bulk-bg/80 backdrop-blur-md border-b border-bulk-border">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/bulk-logo-white.png" alt="BULK" className="h-6" />
                        <span className="text-bulk-muted text-sm border-l border-bulk-border pl-3 ml-1">
                            Card
                        </span>
                    </div>
                </div>
            </header>

            <main className="min-h-screen pt-24 pb-12 px-6 relative z-10">
                <div className="w-full max-w-7xl mx-auto space-y-8">

                    <div className="space-y-4 animate-fade-in">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-ibm">
                            Generate Your <span className="text-bulk-accent">BULK Card</span>
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                        <div className="space-y-8 animate-fade-in delay-100">
                            <div className="space-y-6 bg-bulk-panel p-6 rounded-xl border border-bulk-border backdrop-blur-xl shadow-2xl">
                                <Input
                                    label="X (Twitter) Username"
                                    placeholder="elonmusk"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={isGenerating}
                                />

                                <Input
                                    label="Custom Tagline"
                                    placeholder="hi bulkie!"
                                    value={tagline}
                                    onChange={(e) => setTagline(e.target.value)}
                                    disabled={isGenerating}
                                />

                                <BackgroundSelector
                                    selectedPath={selectedBackground}
                                    onSelect={setSelectedBackground}
                                />

                                <CardBackgroundSelector
                                    selectedPath={selectedCardBackground}
                                    onSelect={setSelectedCardBackground}
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
                                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("hi bulkie ✦ this one's mine! @bulktrade https://www.bulkcard.org/")}`}
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
