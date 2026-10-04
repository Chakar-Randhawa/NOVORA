# NOVORA — FUTURE INTEGRATIONS ARCHITECTURE (DISABLED BY DEFAULT)

In strict adherence to the **Zero-Cost Policy**, all paid integrations, subscriptions, payment gateways, and billed AI APIs are **completely disabled by default** in this release.

When the business grows and the owner explicitly chooses to activate paid tiers, the following adapter contracts can be toggled without rewriting core marketplace modules:

---

## 1. Payment Gateway & Escrow Processing
* **Contract Interface:** `PaymentAdapter` (disabled)
* **Future Candidates:** Stripe Connect, Lemon Squeezy, Razorpay, Wise
* **Current Initial Release State:** Buyers and sellers coordinate direct payment and shipping terms. $0 platform fees.
* **Activation Requirement:** The platform owner must manually register an account, undergo merchant onboarding, and supply backend webhook secrets.

## 2. Advanced Large Language Model (AI) Need Matching
* **Contract Interface:** `NovoraAIAdapter` (`src/services/aiAdapter.ts`)
* **Current Initial Release State:** Runs local rule-based heuristic parsing and scoring with $0 cost.
* **Future Candidates:** WebLLM (runs open models in browser WebGPU at $0 cost) or a free-tier Gemini API server proxy route.
* **Activation Requirement:** Verifying zero billing activation or explicit user opt-in for paid model tokens.

## 3. Distributed Cloud Object Storage
* **Contract Interface:** `StorageAdapter` (disabled)
* **Current Initial Release State:** HTML5 Canvas client-side JPEG compression (<250KB per image) with browser persistence.
* **Future Candidates:** Cloudflare R2 (10GB free tier), Supabase Storage free tier, Backblaze B2.
* **Activation Requirement:** Verifying that no credit card is required to prevent accidental burst billing.

## 4. Email & Transactional Notifications
* **Contract Interface:** `NotificationAdapter` (disabled)
* **Current Initial Release State:** In-app conversation badges and real-time state alerts.
* **Future Candidates:** Resend free tier (3,000 emails/month free), Brevo free tier (300 emails/day free).
* **Activation Requirement:** Manual domain DNS verification (DKIM/SPF) and owner opt-in.
