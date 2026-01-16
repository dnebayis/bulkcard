# Future Enhancements

## Phase 2: Advanced Features

### Multiple Card Templates
- [ ] Classic BULK (current default)
- [ ] Compact variant (1080x1080 square)
- [ ] Wide banner (1500x500)
- [ ] Story format (1080x1920 vertical)

**Implementation:**
```typescript
// lib/templates.ts
export type CardTemplate = 'classic' | 'compact' | 'wide' | 'story';

export const TEMPLATES: Record<CardTemplate, TemplateConfig> = {
  classic: { width: 1200, height: 630, layout: 'horizontal' },
  compact: { width: 1080, height: 1080, layout: 'square' },
  // ...
};
```

### Theme System
- [ ] Dark mode (current)
- [ ] Light mode variant
- [ ] Custom color picker
- [ ] Preset palettes (BULK Green, Cyber Blue, Sunset Orange)

### User-Generated Content
- [ ] Custom taglines (replace "Built for the BULK ecosystem")
- [ ] Upload custom backgrounds
- [ ] Custom fonts selection
- [ ] Text color customization

## Phase 3: Backend Integration

### Database Layer
- [ ] Save generated cards to database
- [ ] User gallery of previously generated cards
- [ ] Public card gallery (optional)

**Tech Stack:**
- Supabase or Vercel Postgres
- Prisma ORM
- S3 or Vercel Blob for image storage

### Authentication
- [ ] Social login (X, Google, GitHub)
- [ ] User profiles
- [ ] Saved preferences

**Options:**
- NextAuth.js
- Clerk
- Supabase Auth

### API Endpoints
```typescript
// app/api/cards/route.ts
POST /api/cards - Create and save card
GET /api/cards - List user's cards
DELETE /api/cards/[id] - Delete card

// app/api/share/route.ts
POST /api/share - Generate shareable link
```

## Phase 4: Advanced Features

### Real-Time X Integration
- [ ] Fetch real X profile data (followers, bio)
- [ ] Display verified badge if applicable
- [ ] Show latest tweet or engagement stats

**Requires:**
- X API v2 access (requires approval)
- Twitter Developer account

### Batch Generation
- [ ] Generate cards for multiple users at once
- [ ] Export as ZIP file
- [ ] CSV import for batch processing

### Analytics Dashboard
- [ ] Track card generations per day
- [ ] Most popular usernames
- [ ] Download/share conversion rates
- [ ] Geographic distribution (optional)

**Tools:**
- Vercel Analytics
- Custom event tracking
- Posthog or Mixpanel

## Phase 5: Premium Features

### Pro Tier
- [ ] Remove BULK branding (white-label)
- [ ] Unlimited custom templates
- [ ] Priority rendering
- [ ] API access for integrations

**Monetization:**
- Stripe integration
- Subscription model ($5-10/month)
- One-time purchase for lifetime access

### Enterprise Features
- [ ] Team accounts
- [ ] Brand guidelines enforcement
- [ ] Bulk API access
- [ ] Custom domain hosting
- [ ] SSO integration

## Quick Wins (Can Implement Soon)

### 1. Keyboard Shortcuts
```typescript
// Add to app/page.tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey && e.key === 'k') {
      // Focus username input
    }
    if (e.metaKey && e.key === 'Enter') {
      // Generate card
    }
    if (e.metaKey && e.key === 'd') {
      // Download PNG
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 2. Copy to Clipboard
Add button to copy generated card directly to clipboard:
```typescript
const handleCopyToClipboard = async () => {
  const blob = await exportCanvasToPNG(canvasRef.current);
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob })
  ]);
};
```

### 3. QR Code Integration
Add QR code linking to user's X profile on the card:
```bash
npm install qrcode
```

### 4. Social Proof
- Display "X cards generated today" counter
- Show recent generations (anonymized)
- Add testimonials section

### 5. Dark/Light Mode Toggle
```typescript
// components/ThemeToggle.tsx
const [theme, setTheme] = useState<'dark' | 'light'>('dark');
// Update CSS variables dynamically
```

## Technical Improvements

### Performance
- [ ] Implement Web Workers for canvas rendering
- [ ] Add service worker for offline functionality
- [ ] Optimize font loading (preload critical fonts)
- [ ] Implement skeleton loading states

### Accessibility
- [ ] Add ARIA labels to all interactive elements
- [ ] Keyboard navigation improvements
- [ ] Screen reader announcements for state changes
- [ ] High contrast mode support

### Testing
- [ ] Unit tests (Vitest or Jest)
- [ ] E2E tests (Playwright)
- [ ] Visual regression tests (Percy or Chromatic)
- [ ] Performance testing (Lighthouse CI)

### DevOps
- [ ] GitHub Actions for CI/CD
- [ ] Automated lighthouse audits
- [ ] Dependabot for dependency updates
- [ ] Preview deployments for PRs

## Mobile App

### React Native Version
- [ ] Cross-platform mobile app (iOS + Android)
- [ ] Native share sheet integration
- [ ] Camera roll access for direct posting
- [ ] Push notifications for engagement

### Progressive Web App (PWA)
- [ ] Add manifest.json
- [ ] Enable offline mode
- [ ] Add to home screen prompt
- [ ] Install banner

## Community Features

### Open Source
- [ ] Accept community templates
- [ ] Template marketplace
- [ ] Plugin system for custom renderers
- [ ] Community gallery

### Integrations
- [ ] Zapier integration
- [ ] Figma plugin
- [ ] Slack bot
- [ ] Discord bot
- [ ] Chrome extension

## Infrastructure

### CDN & Caching
- [ ] Cloudflare for CDN
- [ ] Redis for session caching
- [ ] Cache generated cards (if backend added)

### Monitoring
- [ ] Sentry for error tracking
- [ ] Datadog for APM
- [ ] UptimeRobot for uptime monitoring

### Rate Limiting
```typescript
// middleware.ts (if abuse detected)
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

## Marketing & Growth

### SEO
- [ ] Add blog for content marketing
- [ ] Generate sitemap.xml
- [ ] Add structured data (JSON-LD)
- [ ] Meta tags optimization per template

### Social Sharing
- [ ] Auto-generate OG images for landing page
- [ ] Add social proof badges
- [ ] Twitter Card validator integration

### Email Campaigns
- [ ] Collect emails (optional newsletter)
- [ ] Send weekly card inspiration
- [ ] New template launch notifications

---

**Prioritization Framework:**

1. **P0 (Critical)**: Bug fixes, security patches
2. **P1 (High)**: Quick wins, user-requested features
3. **P2 (Medium)**: Premium features, integrations
4. **P3 (Low)**: Nice-to-haves, experimental features

**Next Steps:**
Review this document with the team, prioritize based on user feedback, and create GitHub issues for each enhancement.
