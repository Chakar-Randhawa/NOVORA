# NOVORA — DEPLOYMENT GUIDE (ZERO-COST DEPLOYMENT)

NOVORA is designed to build and deploy cleanly to any free static or container hosting platform without requiring payment details.

---

## 1. Google AI Studio Container Deployment (Current Live Platform)

NOVORA runs out of the box in the Google AI Studio containerized environment:
- **Dev App URL:** `https://ais-dev-fex6l6oyntir5elme62iqh-800708644628.asia-southeast1.run.app`
- **Shared App URL:** `https://ais-pre-fex6l6oyntir5elme62iqh-800708644628.asia-southeast1.run.app`
- **Cost:** $0.00
- **Card Required:** No

Build command:
```bash
npm run build
```

The compiled assets are placed in `/dist` and served through the Vite production server or any static web server.

---

## 2. Cloudflare Pages Deployment ($0 Free Tier, No Card)

1. Push your repository to GitHub or GitLab.
2. Sign up for a free account at [pages.cloudflare.com](https://pages.cloudflare.com).
3. Connect your repository.
4. Set Build Settings:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Click **Deploy**.
6. Cloudflare provides a permanent, free public subdomain: `https://novora.pages.dev`.
7. **Cost:** $0.00 / permanently free tier.

---

## 3. GitHub Pages Deployment ($0 Free Tier, No Card)

1. Install `gh-pages`:
   ```bash
   npm install --save-dev gh-pages
   ```
2. Add deploy script to `package.json`:
   ```json
   "deploy": "vite build && gh-pages -d dist"
   ```
3. Run `npm run deploy`.
4. Your marketplace is live at `https://<username>.github.io/<repo-name>/`.
