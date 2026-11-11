import type { CollusionPair, Submission } from "../contracts";

function normalizeText(text: string): string[] {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((w) => w.length > 0);
}

function getShingles(words: string[], k = 5): Set<string> {
  const shingles = new Set<string>();
  if (words.length < k) {
    if (words.length > 0) shingles.add(words.join(" "));
    return shingles;
  }
  for (let i = 0; i <= words.length - k; i++) {
    shingles.add(words.slice(i, i + k).join(" "));
  }
  return shingles;
}

function cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [key, valA] of vecA.entries()) {
    normA += valA * valA;
    const valB = vecB.get(key) || 0;
    dotProduct += valA * valB;
  }
  for (const valB of vecB.values()) {
    normB += valB * valB;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function termFrequencyVector(words: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const w of words) {
    map.set(w, (map.get(w) || 0) + 1);
  }
  return map;
}

export interface CollusionDetectOptions {
  question?: string;
  referenceAnswer?: string;
  containmentHighThreshold?: number; // tuned to 0.08 for 5-shingle paraphrased pairs
  containmentMedThreshold?: number; // tuned to 0.05
  cosineMedThreshold?: number; // tuned to 0.80
}

/**
 * Within-batch similarity & collusion analysis per Architecture §9:
 * 1. 5-gram word shingles
 * 2. Template removal (>50% frequency or in question/reference)
 * 3. Jaccard & Containment metrics
 * 4. Cosine similarity
 * 5. Extract shared continuous passages
 */
export function detectCollusion(
  submissions: Submission[],
  options: CollusionDetectOptions = {}
): CollusionPair[] {
  const {
    question = "",
    referenceAnswer = "",
    containmentHighThreshold = 0.08,
    containmentMedThreshold = 0.05,
    cosineMedThreshold = 0.8,
  } = options;

  if (submissions.length < 2) return [];

  // 1. Build template shingles
  const templateWords = [
    ...normalizeText(question),
    ...normalizeText(referenceAnswer),
  ];
  const templateShingles = getShingles(templateWords, 5);

  // Collect all submission shingles to filter ubiquitous shingles (>50% of cohort)
  const subWordLists = submissions.map((s) => ({
    id: s.pseudonym || s.id,
    words: normalizeText(s.textOriginal),
  }));

  const subShingleSets = subWordLists.map((item) => ({
    id: item.id,
    words: item.words,
    shingles: getShingles(item.words, 5),
    tfVector: termFrequencyVector(item.words),
  }));

  const shingleDocCount = new Map<string, number>();
  for (const item of subShingleSets) {
    for (const sh of item.shingles) {
      shingleDocCount.set(sh, (shingleDocCount.get(sh) || 0) + 1);
    }
  }

  const majorityThreshold = submissions.length * 0.5;
  const filteredSets = subShingleSets.map((item) => {
    const filtered = new Set<string>();
    for (const sh of item.shingles) {
      if (!templateShingles.has(sh) && (shingleDocCount.get(sh) || 0) <= majorityThreshold) {
        filtered.add(sh);
      }
    }
    return {
      ...item,
      shingles: filtered,
    };
  });

  const pairs: CollusionPair[] = [];

  for (let i = 0; i < filteredSets.length; i++) {
    for (let j = i + 1; j < filteredSets.length; j++) {
      const setA = filteredSets[i].shingles;
      const setB = filteredSets[j].shingles;

      if (setA.size === 0 || setB.size === 0) continue;

      let intersectionCount = 0;
      const sharedShingles: string[] = [];
      for (const sh of setA) {
        if (setB.has(sh)) {
          intersectionCount++;
          sharedShingles.push(sh);
        }
      }

      const unionCount = new Set([...setA, ...setB]).size;
      const jaccard = unionCount > 0 ? intersectionCount / unionCount : 0;
      const minSize = Math.min(setA.size, setB.size);
      const containment = minSize > 0 ? intersectionCount / minSize : 0;

      const cosine = cosineSimilarity(
        filteredSets[i].tfVector,
        filteredSets[j].tfVector
      );

      let level: "high" | "medium" | null = null;
      if (containment >= containmentHighThreshold) {
        level = "high";
      } else if (containment >= containmentMedThreshold && cosine >= cosineMedThreshold) {
        level = "medium";
      }

      if (level) {
        // Construct shared passages
        const passageA = sharedShingles.slice(0, 3).join(". ");
        const passageB = sharedShingles.slice(0, 3).join(". ");

        pairs.push({
          a: filteredSets[i].id,
          b: filteredSets[j].id,
          containment: Math.round(containment * 1000) / 1000,
          jaccard: Math.round(jaccard * 1000) / 1000,
          cosine: Math.round(cosine * 1000) / 1000,
          level,
          sharedPassages: [
            {
              textA: passageA || "Shared passage across submissions.",
              textB: passageB || "Shared passage across submissions.",
            },
          ],
        });
      }
    }
  }

  return pairs;
}
