

export interface CardData {
    username: string;
    displayName?: string;
    backgroundPath?: string; // Bulkie background
    cardBackgroundPath?: string; // Card scenic background
    tagline?: string;
}

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

const COLORS = {
    bg: '#1b1a16',
    panel: '#24221d',
    border: '#2a2823',
    text: '#eae7df',
    muted: '#8f8b86',
    accent: '#139572',
};

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

const loadAvatarWithRetry = async (username: string): Promise<HTMLImageElement | null> => {
    const proxyUrl = `/api/avatar?username=${encodeURIComponent(username)}`;
    const avatarImage = await loadImageSafe(proxyUrl, 15000);
    return avatarImage;
};

const createFallbackAvatar = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, size, size);

    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, COLORS.panel);
    gradient.addColorStop(0.7, COLORS.bg);
    gradient.addColorStop(1, COLORS.border);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    // Round Rect for fallback background
    ctx.roundRect(0, 0, size, size, 50); // Proportional radius (40/320 * 400 = 50)
    ctx.fill();

    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    // Inner decorative border
    ctx.roundRect(10, 10, size - 20, size - 20, 45);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

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

    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // Load optional card background (scenic/atmospheric)
    if (data.cardBackgroundPath) {
        const cardBgImage = await loadImageSafe(data.cardBackgroundPath, 3000);
        if (cardBgImage) {
            ctx.save();
            const scale = Math.max(CARD_WIDTH / cardBgImage.width, CARD_HEIGHT / cardBgImage.height);
            const w = cardBgImage.width * scale;
            const h = cardBgImage.height * scale;
            const x = (CARD_WIDTH - w) / 2;
            const y = (CARD_HEIGHT - h) / 2;

            ctx.globalAlpha = 0.3;
            ctx.drawImage(cardBgImage, x, y, w, h);
            ctx.globalAlpha = 1.0;
            ctx.restore();
        }
    }

    const bgPath = data.backgroundPath || '/backgrounds/1.png';
    const bgImage = await loadImageSafe(bgPath, 3000);

    let mascotLeftX = CARD_WIDTH;

    if (bgImage) {
        ctx.save();
        // Fixed height for all mascots to ensure consistency
        const fixedMascotHeight = 420; // Reduced from 68% (was ~462px) to fixed 420px
        const scale = fixedMascotHeight / bgImage.height;
        const w = bgImage.width * scale;
        const h = fixedMascotHeight;

        const x = CARD_WIDTH - w; // Align to right edge
        const y = CARD_HEIGHT - h; // Align to bottom edge

        mascotLeftX = x; // Update collision boundary

        ctx.drawImage(bgImage, x, y, w, h);
        ctx.restore();
    }



    const padding = 60;
    const avatarSize = 320; // Reduced from 370 to give more space for text
    const textGap = 50;

    const panelHeight = avatarSize;
    const panelY = (CARD_HEIGHT - panelHeight) / 2;

    const avatarX = padding;
    const avatarY = panelY;


    const loaded = await loadAvatarWithRetry(data.username);
    const avatarImage: HTMLImageElement | HTMLCanvasElement = loaded
        ? loaded
        : createFallbackAvatar(document.createElement('canvas'));

    ctx.save();
    ctx.beginPath();
    // Square with rounded edges (PFP Frame)
    ctx.roundRect(avatarX, avatarY, avatarSize, avatarSize, 40);
    ctx.clip();


    if (avatarImage) {
        ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
    }
    ctx.restore();


    ctx.beginPath();
    ctx.roundRect(avatarX, avatarY, avatarSize, avatarSize, 40);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; // Subtle ring
    ctx.stroke();


    const textStartX = avatarX + avatarSize + textGap;
    const maxTextWidth = mascotLeftX - textStartX - 40; // 40px buffer from mascot

    ctx.fillStyle = COLORS.text;
    ctx.textBaseline = 'alphabetic'; // Easier to stack from top-down

    // Determine Hierarchy
    const primaryText = data.displayName ? data.displayName : `@${data.username}`;
    const secondaryText = data.displayName ? `@${data.username}` : null;
    const tertiaryText = data.tagline || ""; // No default fallback

    // Text Sizes
    let primaryFontSize = 85;
    const secondaryFontSize = 42;
    const tertiaryFontSize = 56;

    // Gaps
    const gap1 = 24;
    const gap2 = 64;

    // Measure Primary (Shrink if needed)
    ctx.font = `bold ${primaryFontSize}px "IBM Plex Sans", sans-serif`;
    while (ctx.measureText(primaryText).width > maxTextWidth && primaryFontSize > 40) {
        primaryFontSize -= 4;
        ctx.font = `bold ${primaryFontSize}px "IBM Plex Sans", sans-serif`;
    }

    // Measure Secondary (Handle)
    if (secondaryText) {
        ctx.font = `600 ${secondaryFontSize}px "IBM Plex Sans", sans-serif`;
        // No shrinking logic needed for small handle usually, but safe to assume it fits
    }

    // Measure Tertiary (Tagline)
    let finalTertiaryFontSize = tertiaryFontSize;
    ctx.font = `600 ${tertiaryFontSize}px "Barlow", sans-serif`;
    while (ctx.measureText(tertiaryText).width > maxTextWidth && finalTertiaryFontSize > 20) {
        finalTertiaryFontSize -= 2;
        ctx.font = `600 ${finalTertiaryFontSize}px "Barlow", sans-serif`;
    }

    // Calculate Total Height (Caps Height approx)
    const h1 = primaryFontSize * 0.9;
    const h2 = secondaryText ? secondaryFontSize * 1.0 : 0;
    const h3 = tertiaryText ? finalTertiaryFontSize * 0.9 : 0;

    // Total Stack Height
    let totalHeight = h1;
    if (secondaryText) totalHeight += gap1 + h2;
    if (tertiaryText) totalHeight += gap2 + h3;

    // Center Y relative to Panel Center
    const panelCenterY = panelY + panelHeight / 2;
    // Shift StartY so the visual center of stack matches PanelCenterY
    const startY = panelCenterY - (totalHeight / 2) + (h1 * 0.8);

    // DRAW STACK
    let currentY = startY;

    // 1. Primary
    ctx.font = `bold ${primaryFontSize}px "IBM Plex Sans", sans-serif`;
    ctx.fillStyle = COLORS.text;
    ctx.fillText(primaryText, textStartX, currentY);

    // 2. Secondary
    if (secondaryText) {
        currentY += gap1 + (secondaryFontSize * 0.9);
        ctx.font = `600 ${secondaryFontSize}px "IBM Plex Sans", sans-serif`;
        ctx.fillStyle = COLORS.text;
        ctx.fillText(secondaryText, textStartX, currentY);
    }

    // 3. Tertiary
    if (tertiaryText) {
        currentY += gap2 + (finalTertiaryFontSize * 0.8);

        ctx.font = `600 ${finalTertiaryFontSize}px "Barlow", sans-serif`;
        ctx.fillStyle = COLORS.text;
        ctx.fillText(tertiaryText, textStartX, currentY);
    }

    // Draw "ACCESS CARD" Status Badge (Top Left Corner)
    const statusText = 'ACCESS CARD';

    ctx.save();

    const paddingX = 16;
    ctx.font = '900 32px "Barlow", sans-serif'; // UI / Label (DIN)
    ctx.textBaseline = 'middle';

    // Fixed width to match PFP
    const badgeW = avatarSize;
    const badgeH = 50;

    // Position: Top Right
    const margin = 60; // Consistent margin
    const frameX = CARD_WIDTH - badgeW - margin; // Right-aligned
    const frameTop = margin; // Top padding
    const textY_Badge = frameTop + (badgeH / 2);
    // Center text in badge
    const textX_Badge = frameX + (badgeW / 2);
    ctx.textAlign = 'center';

    // Draw Frame Background - Transparent (Unchecked)
    ctx.beginPath();
    ctx.roundRect(frameX, frameTop, badgeW, badgeH, 6); // Sharper radius
    // ctx.fillStyle = 'rgba(19, 149, 114, 0.15)'; // Removed fill
    // ctx.fill();

    // Draw Frame Border - Technical/Precise
    ctx.strokeStyle = 'rgba(143, 139, 134, 0.5)'; // Muted grey-ish border
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0; // No Border Glow
    ctx.stroke();

    ctx.fillStyle = COLORS.text; // Use standard off-white text instead of pure white

    // Text - Clean, No Glow
    ctx.shadowBlur = 0;
    ctx.fillText(statusText, textX_Badge, textY_Badge);

    ctx.restore();





    const logoImg = await loadImageSafe('/logo.png');
    if (logoImg) {
        const logoTargetHeight = 50;
        const scale = logoTargetHeight / logoImg.height;
        const logoWidth = logoImg.width * scale;

        ctx.save();
        ctx.globalAlpha = 1.0;
        const margin = 60; // Top/Left Margin (Consistent 60px)
        ctx.drawImage(logoImg, margin, margin, logoWidth, logoTargetHeight);
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
