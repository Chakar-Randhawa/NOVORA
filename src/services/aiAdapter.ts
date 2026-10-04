/**
 * NOVORA AI Adapter Interface
 * 
 * Strict Zero-Cost Policy Compliance:
 * - Runtime paid AI inference calls are permanently disabled by default.
 * - This architecture uses a zero-cost local rule-based engine (`discoveryEngine.ts`).
 * - If a verified free-tier offline or local LLM/WebLLM service is connected in the future,
 *   it plugs in here without altering marketplace core logic or breaking the $0 budget.
 */

import { ParsedNeed, parseNaturalNeed } from './discoveryEngine';

export interface AIProviderConfig {
  enabled: boolean;
  provider: 'local-rules-engine' | 'browser-webllm' | 'free-tier-proxy';
  hasPaymentRequirement: false; // Must strictly remain false
}

export const CURRENT_AI_CONFIG: AIProviderConfig = {
  enabled: true,
  provider: 'local-rules-engine',
  hasPaymentRequirement: false
};

export interface AIAdapterResponse {
  parsedNeed: ParsedNeed;
  explanation: string;
  source: string;
}

export class NovoraAIAdapter {
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig = CURRENT_AI_CONFIG) {
    this.config = config;
  }

  public isZeroCostVerified(): boolean {
    return this.config.hasPaymentRequirement === false;
  }

  public async parseUserNeed(query: string): Promise<AIAdapterResponse> {
    // Zero-Cost Local Engine: operates entirely client-side with 0 external network requests
    const parsed = parseNaturalNeed(query);

    const intentPhrases: string[] = [];
    if (parsed.categoryMatch) {
      intentPhrases.push(`Category: ${parsed.categoryMatch.name}`);
    }
    if (parsed.maxBudget) {
      intentPhrases.push(`Max Budget: $${parsed.maxBudget}`);
    }
    if (parsed.destinationCountry) {
      intentPhrases.push(`Shipping to: ${parsed.destinationCountry.name}`);
    }
    if (parsed.requiresCustomization) {
      intentPhrases.push(`Customization: Required`);
    }

    const explanation = intentPhrases.length > 0
      ? `Identified buyer requirements: ${intentPhrases.join(' · ')}.`
      : `Parsed ${parsed.extractedKeywords.length} core search keywords for discovery matching.`;

    return {
      parsedNeed: parsed,
      explanation,
      source: 'Zero-Cost Local Heuristic Parser'
    };
  }
}

export const aiAdapter = new NovoraAIAdapter();
