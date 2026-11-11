export interface SanitizationResult {
  sanitizedText: string;
  removedChars: { kind: string; count: number }[];
  hiddenText: { text: string; reason: "vanish" | "white" | "tiny" }[];
}

/**
 * Sanitizes extracted document text per Architecture §6.2:
 * - Unicode NFKC normalization
 * - Strips and counts zero-width, bidi control, and tag characters
 * - Strips DOCX/PDF hidden runs and records them as hiddenText
 */
export function sanitize(
  text: string,
  existingHiddenRuns: { text: string; reason: "vanish" | "white" | "tiny" }[] = []
): SanitizationResult {
  const normalized = text.normalize("NFKC");
  const removedChars: { kind: string; count: number }[] = [];
  const hiddenText = [...existingHiddenRuns];

  // Zero-width characters (U+200B-U+200F, U+2060-U+2064, U+FEFF)
  const zeroWidthRegex = /[\u200B-\u200F\u2060-\u2064\uFEFF]/g;
  const zwMatches = normalized.match(zeroWidthRegex);
  const zwCount = zwMatches ? zwMatches.length : 0;
  if (zwCount > 0) {
    removedChars.push({ kind: "zero-width", count: zwCount });
  }
  let cleaned = normalized.replace(zeroWidthRegex, "");

  // Bidi controls (U+202A-U+202E, U+2066-U+2069)
  const bidiRegex = /[\u202A-\u202E\u2066-\u2069]/g;
  const bidiMatches = cleaned.match(bidiRegex);
  const bidiCount = bidiMatches ? bidiMatches.length : 0;
  if (bidiCount > 0) {
    removedChars.push({ kind: "bidi-control", count: bidiCount });
  }
  cleaned = cleaned.replace(bidiRegex, "");

  // Tag characters (U+E0000-U+E007F)
  const tagRegex = /[\u{E0000}-\u{E007F}]/gu;
  const tagMatches = cleaned.match(tagRegex);
  const tagCount = tagMatches ? tagMatches.length : 0;
  if (tagCount > 0) {
    removedChars.push({ kind: "tag-character", count: tagCount });
  }
  cleaned = cleaned.replace(tagRegex, "");

  // Strip any text that was detected as hidden runs in the original document
  for (const hidden of existingHiddenRuns) {
    if (hidden.text.trim()) {
      cleaned = cleaned.split(hidden.text).join("");
    }
  }

  return {
    sanitizedText: cleaned.trim(),
    removedChars,
    hiddenText,
  };
}
