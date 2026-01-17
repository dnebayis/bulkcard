

export interface CardData {
    username: string;
    backgroundPath?: string;
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
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 10, 0, Math.PI * 2);
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

    const staticBgImage = await loadImageSafe('/card-background.jpg', 3000);
    if (staticBgImage) {
        ctx.save();
        const scale = Math.max(CARD_WIDTH / staticBgImage.width, CARD_HEIGHT / staticBgImage.height);
        const w = staticBgImage.width * scale;
        const h = staticBgImage.height * scale;
        const x = (CARD_WIDTH - w) / 2;
        const y = (CARD_HEIGHT - h) / 2;

        ctx.globalAlpha = 0.3;
        ctx.drawImage(staticBgImage, x, y, w, h);
        ctx.globalAlpha = 1.0; // Reset opacity
        ctx.restore();
    }

    const bgPath = data.backgroundPath || '/backgrounds/1.png';
    const bgImage = await loadImageSafe(bgPath, 3000);

    let mascotLeftX = CARD_WIDTH;

    if (bgImage) {
        ctx.save();
        const maxMascotHeight = CARD_HEIGHT * 0.65; // Reduced size
        const scale = maxMascotHeight / bgImage.height;
        const w = bgImage.width * scale;
        const h = bgImage.height * scale;

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
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.clip();


    if (avatarImage) {
        ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
    }
    ctx.restore();


    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; // Subtle ring
    ctx.stroke();


    const textStartX = avatarX + avatarSize + textGap;
    const maxTextWidth = mascotLeftX - textStartX - 40; // 40px buffer from mascot

    ctx.fillStyle = COLORS.text;
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 85px Inter, sans-serif'; // Increased from 72
    let fontSize = 85;
    while (ctx.measureText(`@${data.username}`).width > maxTextWidth && fontSize > 40) {
        fontSize -= 4;
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    }

    // Start text stack higher to center evenly around the Avatar
    // CenterY - 80 puts the Status Badge (at +80) exactly in the middle
    const textY_Handle = panelY + panelHeight / 2 - 80;
    ctx.fillText(`@${data.username}`, textStartX, textY_Handle);

    // Draw "ACCESS GRANTED" Status Badge (Bulkie Green)
    // POSITION: Below Username, Above Tagline
    const statusText = 'ACCESS GRANTED';
    const statusY = textY_Handle + 80; // Increased spacing (was 60)

    ctx.save();

    const paddingX = 16; // More internal spacing

    // Set Font BEFORE measuring to get correct width
    ctx.font = '900 32px Inter, sans-serif'; // Massively Bold
    ctx.textBaseline = 'middle';

    const metric = ctx.measureText(statusText);
    const badgeW = metric.width + (paddingX * 2);
    const badgeH = 50; // Taller Height

    // Adjusted coordinates for "Frame hugging text":
    // Align Frame Left Edge with textStartX
    const frameX = textStartX;
    const textX = textStartX + paddingX; // Indent text inside the frame
    const frameTop = statusY - (badgeH / 2);

    // Draw Frame Background - Holographic Ribbon Effect
    const holoGrad = ctx.createLinearGradient(frameX, frameTop, frameX + badgeW, frameTop + badgeH);
    holoGrad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    holoGrad.addColorStop(0.2, 'rgba(0, 255, 255, 0.4)'); // Cyan
    holoGrad.addColorStop(0.4, 'rgba(255, 0, 255, 0.4)'); // Magenta
    holoGrad.addColorStop(0.6, 'rgba(255, 255, 0, 0.4)'); // Yellow
    holoGrad.addColorStop(0.8, 'rgba(0, 255, 255, 0.4)'); // Cyan
    holoGrad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');

    ctx.beginPath();
    ctx.roundRect(frameX, frameTop, badgeW, badgeH, 10);
    ctx.fillStyle = holoGrad;
    ctx.fill();

    // Draw Frame Border - White/Holographic Outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'cyan';
    ctx.shadowBlur = 15;
    ctx.stroke();

    ctx.fillStyle = '#ffffff'; // White text for Hologram Contrast

    // Text Glow - Double Layer for "Bloom"
    ctx.shadowColor = COLORS.accent;
    ctx.shadowBlur = 30; // Massive outer glow
    ctx.fillText(statusText, textX, statusY);

    ctx.shadowBlur = 10; // Tight inner glow
    ctx.fillText(statusText, textX, statusY);

    ctx.restore();

    // Draw Tagline (Below Status Badge)
    const tagline = data.tagline || "hi bulkie!";
    let taglineSize = 56;
    // Reset font for measurement
    ctx.font = '600 56px Inter, sans-serif';

    while (ctx.measureText(tagline).width > maxTextWidth && taglineSize > 20) {
        taglineSize -= 2;
        ctx.font = `600 ${taglineSize}px Inter, sans-serif`;
    }

    // Set color for tagline
    ctx.fillStyle = COLORS.text;

    const textY_Tagline = statusY + 70; // Increased spacing (was 50)
    ctx.fillText(tagline, textStartX, textY_Tagline);

    const logoImg = await loadImageSafe('/logo.png');
    if (logoImg) {
        const logoTargetHeight = 50;
        const scale = logoTargetHeight / logoImg.height;
        const logoWidth = logoImg.width * scale;

        ctx.save();
        ctx.globalAlpha = 1.0; // "Original level" opacity logic applied to card logo too? User said "background PNGs opacity". I'll keep logo visible.
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
