# NOVORA — FREE STACK VERIFICATION & ARCHITECTURE

This document certifies that NOVORA operates strictly on a **$0.00 budget** with **zero payment information, credit cards, debit cards, or billing accounts required**.

---

## 1. Zero-Cost Technology Inventory

| Layer | Service / Technology | Official Pricing URL | Credit Card Required? | Free Tier Limits | Quota Handling & Behavior | Zero-Cost Fallback |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript + Vite | [vite.dev](https://vite.dev) / Open Source | **NO** | Unlimited (FOSS) | N/A | Next.js / Static HTML |
| **Styling & Design** | Tailwind CSS v4 + Google Fonts | [tailwindcss.com](https://tailwindcss.com) / FOSS | **NO** | Unlimited (FOSS) | N/A | Pure CSS3 / Open Props |
| **Global Database** | Google Cloud Firestore (Spark Free Tier) | [firebase.google.com/pricing](https://firebase.google.com/pricing) | **NO** | 50,000 reads/day, 20,000 writes/day, 1GB storage | Resets daily; fails safely with quota notification without billing | Local preferences / export |
| **Authentication** | Firebase Authentication (Spark Plan) | [firebase.google.com/pricing](https://firebase.google.com/pricing) | **NO** | Unlimited Email/Password + 50,000 Monthly Active Users | Rate limited safely without paid upgrades | Session recovery / password reset |
| **Hosting & Dev Server** | Google AI Studio Development & Preview Run URL | [ai.google.dev](https://ai.google.dev) | **NO** | Free AI Studio container runtime | Graceful standard HTTP response | Cloudflare Pages Free / GitHub Pages |
| **Image Optimization**| Client-Side Canvas JPEG Compressor (max 1000px, quality 0.78) | Browser Canvas API (W3C standard) | **NO** | Zero cloud fees; stored within lightweight payloads (<120KB) | Fits securely within Firestore 1MB document limit | Browser IndexedDB / Free web image URLs |
| **Search & Need Matching** | Zero-Cost Heuristic Intent & Discovery Engine (`discoveryEngine.ts`) | Self-contained client code | **NO** | Unlimited client execution | Pure in-memory scoring; zero API calls | Transformers.js (in-browser WASM) |
| **Security & ABAC** | Firestore Security Rules (`firestore.rules`) | Firebase Spark | **NO** | Server-enforced rule evaluations | Math-proven default-deny access control | Backend validation |

---

## 2. Policy Violations Explicitly Avoided

1. **No Paid AI APIs at Runtime**: NOVORA's "Find My Match" engine runs a high-performance heuristic keyword, intent, budget, and destination parser. It performs zero external paid API calls to OpenAI, Claude, or billed Gemini endpoints.
2. **No Billing Cards for Storage**: Cloudinary, AWS S3, and Firebase Blaze plans requiring a credit card were rejected in favor of zero-cost client-side canvas compression and Firestore document fields under 120KB.
3. **No Paid SMS or Phone Verification**: Standard Google OAuth and email/password authentication is implemented without Twilio or paid SMS gateways.
4. **No Paid Maps API**: Geolocation uses ISO standard country codes and bundled geographic data rather than billed Google Maps Platform APIs.
5. **No Purchased Domain Requirement**: Works out of the box on the AI Studio URL or free provider-generated subdomains (`.run.app`, `.pages.dev`).

---

## 3. Quota Exceeded Procedures

If daily Firestore Spark free tier limits are approached:
- The application displays a clear notification to the user ("Quota exceeded - resets next day").
- High-resolution images are automatically downscaled before submission.
- Real-time listeners unsubscribe cleanly to avoid read unit churn.
- The system never prompts for a credit card or initiates an automatic plan upgrade.
