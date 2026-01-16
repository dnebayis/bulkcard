/**
 * Card Generation Utilities
 * HORIZONTAL card with Dynamic Background Selection
 */

export interface CardData {
    username: string;
    backgroundPath?: string;
}

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

// BULK Design Tokens
const COLORS = {
    bg: '#1b1a16',
    panel: '#24221d',
    border: '#2a2823',
    text: '#eae7df',
    muted: '#8f8b86',
    accent: '#139572',
};

/* ---------- Image Loading ---------- */

const loadImageSafe = async (url: string, timeoutMs: number = 5000): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
        const img = new Image();
        let timeoutId: NodeJS.Timeout;

        const cleanup = () => {
            clearTimeout(timeoutId);
            img.onload = null;
            img.onerror = null;
        };

        timeoutId = setTimeout(() => {
            cleanup();
            resolve(null);
        }, timeoutMs);

        img.onload = () => { cleanup(); resolve(img); };
        img.onerror = () => { cleanup(); resolve(null); };

        img.crossOrigin = 'anonymous';
        img.src = url;
    });
};

/**
 * Load avatar via server-side proxy to avoid CORS issues.
 * This ensures the canvas is never tainted and PNG export always works.
 * 
 * Strategy:
 * 1. Try loading from /api/avatar?username=X
 * 2. If fails, return null (caller will use fallback)
 * 
 * The server handles retry logic internally (fallback=false, default, fallback=true)
 */
const loadAvatarWithRetry = async (username: string): Promise<HTMLImageElement | null> => {
    // Use our server-side proxy instead of direct unavatar.io calls
    const proxyUrl = `/api/avatar?username=${encodeURIComponent(username)}`;

    // 15s timeout (allows server to complete all 3 retry strategies)
    const avatarImage = await loadImageSafe(proxyUrl, 15000);

    return avatarImage;
};

const createFallbackAvatar = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    // Bg
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, size, size);

    // Gradient
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, COLORS.panel);
    gradient.addColorStop(0.7, COLORS.bg);
    gradient.addColorStop(1, COLORS.border);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Rings (Accent Green)
    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Silhouette
    ctx.fillStyle = COLORS.muted;
    ctx.globalAlpha = 0.6;
    const headRadius = size * 0.15;
    const headY = size * 0.35;
    ctx.beginPath();
    ctx.arc(size / 2, headY, headRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    const shoulderY = headY + headRadius;
    const shoulderWidth = size * 0.4;
    const bodyBottom = size * 0.75;
    ctx.moveTo(size / 2 - shoulderWidth / 2, shoulderY + 10);
    ctx.quadraticCurveTo(size / 2 - shoulderWidth / 3, shoulderY + 30, size / 2, bodyBottom);
    ctx.quadraticCurveTo(size / 2 + shoulderWidth / 3, shoulderY + 30, size / 2 + shoulderWidth / 2, shoulderY + 10);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;

    return canvas;
};

/* ------------------ RENDER CARD ------------------ */

export const renderCardToCanvas = async (canvas: HTMLCanvasElement, data: CardData): Promise<void> => {
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    // 1. Base Background (Solid Black)
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // 1.5. Static Background Image (Starry Night) - 50% Opacity
    const staticBgImage = await loadImageSafe('/card-background.jpg', 3000);
    if (staticBgImage) {
        ctx.save();
        // Scale to cover the entire card
        const scale = Math.max(CARD_WIDTH / staticBgImage.width, CARD_HEIGHT / staticBgImage.height);
        const w = staticBgImage.width * scale;
        const h = staticBgImage.height * scale;
        const x = (CARD_WIDTH - w) / 2;
        const y = (CARD_HEIGHT - h) / 2;

        // Set 30% opacity
        ctx.globalAlpha = 0.3;
        ctx.drawImage(staticBgImage, x, y, w, h);
        ctx.globalAlpha = 1.0; // Reset opacity
        ctx.restore();
    }

    // 2. Custom Background Image (Mascot) - Bottom Right Corner
    const bgPath = data.backgroundPath || '/backgrounds/1.png';
    const bgImage = await loadImageSafe(bgPath, 3000);

    // Track where the mascot starts on the x-axis to prevent text overlap
    let mascotLeftX = CARD_WIDTH;

    if (bgImage) {
        ctx.save();
        const maxMascotHeight = CARD_HEIGHT * 0.85;
        const scale = maxMascotHeight / bgImage.height;
        const w = bgImage.width * scale;
        const h = bgImage.height * scale;

        const x = CARD_WIDTH - w; // Align to right edge
        const y = CARD_HEIGHT - h; // Align to bottom edge

        mascotLeftX = x; // Update collision boundary

        ctx.drawImage(bgImage, x, y, w, h);
        ctx.restore();
    }

    // 3. User Avatar & Text Panel
    // Layout Calculation
    const padding = 60;
    const avatarSize = 320; // Reduced from 370 to give more space for text
    const textGap = 50;

    const panelHeight = avatarSize;
    const panelY = (CARD_HEIGHT - panelHeight) / 2;

    // Avatar Position
    const avatarX = padding;
    const avatarY = panelY;

    // Draw Avatar Circle (with Green Ring for Fallback / White for Real)
    // Note: We need to know if it's fallback or not. 
    // Ideally renderCardToCanvas receives a flag or we detect it?
    // Current createFallbackAvatar returns an ImageBitmap/Canvas.
    // Let's assume the ring color logic is inside the avatar generation or we just apply a standard ring.
    // The previous code applied a ring.

    const loaded = await loadAvatarWithRetry(data.username);
    const avatarImage: HTMLImageElement | HTMLCanvasElement = loaded
        ? loaded
        : createFallbackAvatar(document.createElement('canvas'));

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.clip();

    // Draw the avatars
    // ... (Avatar drawing logic logic is below, I need to make sure I don't delete it or I rewrite it)
    // The previous block handled avatar loading. I will reuse the `avatarImage` variable from scope.

    if (avatarImage) {
        ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
    }
    ctx.restore();

    // Draw Ring (White/Green handled by fallback generation? No, ring is drawn ON TOP usually)
    // Actually, fallback avatar HAS the ring drawn IN it.
    // Real avatar needs a ring? 
    // Previous code:
    // ctx.strokeStyle = '#ffffff'; // or green for fallback?
    // distinct ring logic... 
    // Let's just draw a subtle white ring for uniformity if it's a real avatar?
    // Or rely on the fact that fallback has it.
    // For now, I'll add a standard clean ring overlay for "real" feel.

    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; // Subtle ring
    ctx.stroke();


    // 4. Text Content
    // Calculate available width for text
    const textStartX = avatarX + avatarSize + textGap;
    const maxTextWidth = mascotLeftX - textStartX - 40; // 40px buffer from mascot

    ctx.fillStyle = COLORS.text;
    ctx.textBaseline = 'middle';

    // Draw Twitter Handle
    ctx.font = 'bold 85px Inter, sans-serif'; // Increased from 72
    // Measure and fit
    let fontSize = 85;
    while (ctx.measureText(`@${data.username}`).width > maxTextWidth && fontSize > 40) {
        fontSize -= 4;
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    }

    // Adjust Y slightly since font is bigger
    const textY_Handle = panelY + panelHeight / 2 - 25;
    ctx.fillText(`@${data.username}`, textStartX, textY_Handle);

    // Draw Tagline ("hi bulkie!")
    ctx.fillStyle = COLORS.text; // Same color as username (White/E0E0E0)
    ctx.font = '600 42px Inter, sans-serif'; // Increased size since text is shorter

    const tagline = "hi bulkie!";
    let taglineSize = 42;
    // Measure and fit tagline (unlikely to overflow now, but safe to keep)
    while (ctx.measureText(tagline).width > maxTextWidth && taglineSize > 20) {
        taglineSize -= 2;
        ctx.font = `600 ${taglineSize}px Inter, sans-serif`;
    }

    const textY_Tagline = panelY + panelHeight / 2 + 35;
    ctx.fillText(tagline, textStartX, textY_Tagline);

    // 5. Logo (Top Right)
    const logoImg = await loadImageSafe('/logo.png');
    if (logoImg) {
        // ... existing logo logic ...
        const logoTargetHeight = 50;
        const scale = logoTargetHeight / logoImg.height;
        const logoWidth = logoImg.width * scale;

        ctx.save();
        // Draw TOP right
        ctx.globalAlpha = 1.0; // "Original level" opacity logic applied to card logo too? User said "background PNGs opacity". I'll keep logo visible.
        // x = CARD_WIDTH - width - margin
        // y = margin
        const margin = 50;
        ctx.drawImage(logoImg, CARD_WIDTH - logoWidth - margin, margin, logoWidth, logoTargetHeight);
        ctx.restore();
    }
};

/* ------------------ EXPORT ------------------ */

export const exportCanvasToPNG = (canvas: HTMLCanvasElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Failed to create blob'))), 'image/png', 1.0);
    });
};

export const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
