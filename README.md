# NOVORA — Zero-Cost Global Discovery Marketplace

> *"Discover More. Trade Beyond Borders."*

NOVORA is an original, multi-category global classified and discovery marketplace engineered to operate on a strict **$0 external infrastructure budget**. It connects independent artisans, collectors, suppliers, and service providers worldwide without credit card requirements, commission markups, or paid API dependencies.

---

## Key Features

1. **Need-Based Discovery ("Find My Match")**:
   - Buyers describe their needs in natural language (e.g. *"I need a unique handmade gift under $30 that a seller can ship to Canada"*).
   - A client-side heuristic engine extracts intent, budget limits, destination constraints, and keywords.
   - Generates transparent match explanations with zero paid AI calls.

2. **Request Orbit**:
   - Open buyer requests for custom woodworking, translation, bulk production, or vintage restoration.
   - Independent sellers submit structured quotes (proposed price, lead time, deliverables, shipping terms).
   - Buyers can compare offers side by side and initiate direct communication.

3. **Dynamic Category-Specific Listing Forms**:
   - 16+ distinct marketplace specializations (Handmade Crafts, Vintage Horology, Physical Goods, Digital Assets, Professional Services, Wholesale Manufacturing, Equipment Rentals, and Local Classifieds).
   - Dynamic form rendering: displays only relevant fields for each category (e.g. materials/dimensions for crafts, era/provenance for vintage, license/file formats for digital, deliverables/turnaround for services, MOQ/lead time for wholesale).

4. **Zero-Cost Client-Side Image Compression**:
   - Client-side HTML5 Canvas resizing to 1200px max dimension and 82% JPEG quality.
   - Eliminates expensive cloud bucket bills while preserving crisp image detail.

5. **Direct Buyer-Seller Messaging**:
   - Real-time conversation threads linked to specific listings or requests.
   - Built-in rate limiting and anti-spam protection.

6. **World-Class Light-Theme Design**:
   - Crafted with warm neutral ivory `#FAFAF8`, rich charcoal typography `#18181B`, restrained indigo accents, and strict zero-pill metadata discipline.
   - High-fidelity visual assets created specifically for NOVORA.

---

## Zero-Cost Architecture Verification

Consult the dedicated policy documentation:
- **`FREE_STACK.md`**: Complete inventory of services, pricing links, and card-free verification.
- **`FREE_LIMITS.md`**: Operational quotas and client protection thresholds.
- **`DEPLOYMENT.md`**: Setup for Cloudflare Pages, GitHub Pages, or AI Studio Run environments.
- **`SECURITY.md`**: Data isolation, input sanitization, and moderation rules.
- **`FUTURE_INTEGRATIONS.md`**: Clean disabled-by-default adapter contracts for future expansion.

---

## Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server on port 3000
npm run dev

# Run TypeScript validation
npm run lint

# Build production bundle
npm run build
```
