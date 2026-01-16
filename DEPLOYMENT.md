# Deployment Guide

## Vercel Deployment (Recommended)

### Quick Deploy

The easiest way to deploy this Next.js app:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: BULK Card Generator"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

### Vercel CLI

Alternatively, use the Vercel CLI for instant deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Configuration

### Build Settings (Auto-configured by Vercel)

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 20.x

### Environment Variables

No environment variables required! This application is completely frontend-based.

### Custom Domain

After deployment:
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain (e.g., `cards.yourdomain.com`)
4. Follow DNS configuration instructions

## Performance Optimization

### Already Implemented

✅ **Server-Side Rendering (SSR)**: Static generation for instant page loads  
✅ **Image Optimization**: Next.js Image component for avatars  
✅ **Font Optimization**: Google Fonts loaded via CSS with `display=swap`  
✅ **CSS Optimization**: Tailwind purges unused styles in production  
✅ **Code Splitting**: Next.js automatically splits code by route  

### Additional Recommendations

1. **Enable Analytics** (optional)
   - Add Vercel Analytics for performance insights
   - Add Vercel Speed Insights for Core Web Vitals

2. **Add Security Headers** (optional)
   Create `next.config.ts`:
   ```typescript
   const nextConfig = {
     // ... existing config
     async headers() {
       return [
         {
           source: '/(.*)',
           headers: [
             {
               key: 'X-Frame-Options',
               value: 'DENY',
             },
             {
               key: 'X-Content-Type-Options',
               value: 'nosniff',
             },
           ],
         },
       ];
     },
   };
   ```

## Other Deployment Platforms

### Netlify

```bash
npm run build
```

- Build command: `npm run build`
- Publish directory: `.next`

### Cloudflare Pages

Works out of the box with Next.js support.

### Self-Hosted

```bash
npm run build
npm start
```

Run on any Node.js server (v20+).

## Production Checklist

Before deploying to production:

- [ ] Test the build locally: `npm run build && npm start`
- [ ] Verify SEO meta tags are correct
- [ ] Test on mobile devices
- [ ] Test avatar fallback with invalid usernames
- [ ] Verify PNG download works on different browsers
- [ ] Test "Share on X" redirect
- [ ] Add custom domain (optional)
- [ ] Set up monitoring (optional)

## Monitoring & Analytics

### Recommended Tools

1. **Vercel Analytics**: Built-in, zero-config
2. **Google Analytics**: For user behavior tracking
3. **Sentry**: For error tracking (if needed)
4. **Uptime Monitoring**: UptimeRobot, Pingdom, etc.

## Troubleshooting

### Build Fails

- Ensure Node version is 20+
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Canvas Not Working

- Canvas API is browser-only; ensure components use `'use client'`
- Check browser compatibility (Canvas is widely supported)

### Avatar Images Not Loading

- Verify CORS is configured in `next.config.ts`
- Check unavatar.io status
- Fallback avatar should render automatically

## Scaling Considerations

As your app grows, consider:

1. **Add Backend API**: For user data, saved cards, etc.
2. **Database Integration**: Store generated cards
3. **CDN**: Vercel includes CDN by default
4. **Rate Limiting**: Prevent abuse if you add API endpoints
5. **Authentication**: For premium features

## Support

For deployment issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Review [Next.js Deployment Docs](https://nextjs.org/docs/deployment)

---

**Ready to deploy?** Run `vercel` and go live in 60 seconds! 🚀
