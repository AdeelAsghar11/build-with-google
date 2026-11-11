import type { EvidenceItem } from "../contracts";

function normalize(str: string): string {
  return str
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Computes token overlap similarity (Jaccard on words) between two token sequences.
 */
function tokenSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b);
  let matches = 0;
  for (const token of a) {
    if (setB.has(token)) matches++;
  }
  return matches / a.length;
}

/**
 * Evidence verification matching per Architecture §6.5:
 * - Exact substring match -> "verified"
 * - Sliding-window token similarity >= 0.90 -> "verified_fuzzy"
 * - Overlap with quarantined/hidden span -> "rejected_flagged"
 * - Not found -> "rejected"
 * - Quotes < 3 words rejected unless code/math
 */
export function verifyQuote(
  quote: string,
  submissionText: string,
  quarantinedSpans: { text: string }[] = []
): "verified" | "verified_fuzzy" | "rejected" | "rejected_flagged" {
  if (!quote || !quote.trim()) return "rejected";

  const cleanQuote = quote.trim();
  const words = cleanQuote.split(/\s+/).filter(Boolean);

  // Quotes < 3 words require special code/math symbols to be accepted
  if (words.length < 3 && !/[=<>+\-*/_{}()\\[\]]/.test(cleanQuote)) {
    return "rejected";
  }

  // Check overlap with quarantined / removed flagged content
  for (const span of quarantinedSpans) {
    if (span.text && (cleanQuote.includes(span.text) || span.text.includes(cleanQuote))) {
      return "rejected_flagged";
    }
  }

  const normSubmission = normalize(submissionText);
  const normQuote = normalize(cleanQuote);

  // 1. Exact normalized substring match
  if (normSubmission.includes(normQuote)) {
    return "verified";
  }

  // 2. Sliding window token similarity
  const submissionTokens = normSubmission.split(/\s+/).filter(Boolean);
  const quoteTokens = normQuote.split(/\s+/).filter(Boolean);
  const quoteLen = quoteTokens.length;

  for (let delta = -2; delta <= 2; delta++) {
    const windowSize = quoteLen + delta;
    if (windowSize >= 3 && windowSize <= submissionTokens.length) {
      for (let i = 0; i <= submissionTokens.length - windowSize; i++) {
        const window = submissionTokens.slice(i, i + windowSize);
        const sim = tokenSimilarity(quoteTokens, window);
        if (sim >= 0.9) {
          return "verified_fuzzy";
        }
      }
    }
  }

  return "rejected";
}

export function verifyEvidenceList(
  items: EvidenceItem[],
  submissionText: string,
  quarantinedSpans: { text: string }[] = []
): EvidenceItem[] {
  return items.map((item) => {
    const status = verifyQuote(item.quote, submissionText, quarantinedSpans);
    return {
      ...item,
      status,
    };
  });
}
