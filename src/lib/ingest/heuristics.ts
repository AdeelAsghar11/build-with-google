export interface HeuristicHit {
  pattern: string;
  text: string;
  start: number;
  end: number;
}

const INJECTION_PATTERNS: { name: string; regex: RegExp }[] = [
  // English instructions & grade requests
  { name: "ignore_previous", regex: /\bignore\s+(?:all\s+)?(?:previous|prior|above|the)\s+(?:instructions|rubric|rules|prompt)/i },
  { name: "give_marks", regex: /\b(?:give|award|grant)\s+(?:me\s+)?(?:full|\d+\/\d+|\d+\s*marks|20\/20|10\/10|100%|an?\s*A(?:\+)?)/i },
  { name: "deserves_marks", regex: /\bdeserves?\s+(?:full|\d+\/\d+|\d+\s*marks|20\/20|maximum)\s+marks?/i },
  { name: "ai_instruction", regex: /\b(?:dear\s+)?(?:ai|automated|system)\s+grader\b/i },
  { name: "role_play", regex: /\b(?:pretend\s+you\s+are|you\s+are\s+now|developer\s+mode|act\s+as\s+a)\b/i },
  { name: "fake_system", regex: /\b(?:SYSTEM\s*:|\[\s*Grader\s+note\s*:|Rubric\s+update\s*:)/i },
  { name: "effort_plea", regex: /\b(?:worked\s+very\s+hard|scholarship\s+depends|fail\s+this\s+course)\b/i },

  // Urdu & Roman-Urdu patterns
  { name: "roman_urdu_marks", regex: /\b(?:poore|puray|sare|full)\s+number\s+(?:de\s+do|den|chahiye|milnay)/i },
  { name: "roman_urdu_pass", regex: /\b(?:pass\s+kar\s+do|pass\s+kardein|meherbani\s+hogi)\b/i },
  { name: "urdu_script_marks", regex: /[\u0600-\u06FF\s]*(?:پورے\s*نمبر|نمبر\s*دے\s*دو|پاس\s*کر\s*دو)/ },
];

/**
 * Scans text for overt grader-directed instructions or injection attempts in English, Urdu, and Roman-Urdu.
 */
export function scanHeuristics(text: string): HeuristicHit[] {
  const hits: HeuristicHit[] = [];

  for (const item of INJECTION_PATTERNS) {
    let match: RegExpExecArray | null;
    const globalRegex = new RegExp(item.regex.source, item.regex.flags.includes("g") ? item.regex.flags : item.regex.flags + "g");
    while ((match = globalRegex.exec(text)) !== null) {
      hits.push({
        pattern: item.name,
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  return hits;
}
