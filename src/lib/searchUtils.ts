import { Product } from '@/services/productService';

export const getLevenshteinDistance = (a: string, b: string): number => {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, (_, i) => i)
  );
  for (let i = 1; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 1; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[a.length][b.length];
};

/**
 * Scrapes metadata (brands, categories, names, tags) out of the entire product catalogue 
 * and fuzzily checks if the user's latest word is a typo of a highly indexed keyword.
 */
export const getAutocorrectSuggestion = (query: string, products: Product[]): string | null => {
  const words = query.toLowerCase().split(/\s+/);
  const lastWord = words[words.length - 1];
  if (lastWord.length < 3) return null;

  // Build the live contextual dictionary
  const dictionarySet = new Set<string>();

  products.forEach(p => {
    if (p.brands?.name) p.brands.name.toLowerCase().split(/\s+/).forEach(w => dictionarySet.add(w));
    if (p.categories?.name) p.categories.name.toLowerCase().split(/\s+/).forEach(w => dictionarySet.add(w));
    if (p.name) p.name.toLowerCase().split(/\s+/).forEach(w => dictionarySet.add(w));
    if (p.title) p.title.toLowerCase().split(/\s+/).forEach(w => dictionarySet.add(w));
    if (p.tags) p.tags.forEach(t => dictionarySet.add(t.toLowerCase()));
  });

  const dbWords = Array.from(dictionarySet);

  let bestMatch = null;
  let minDistance = 3; // Max threshold for a typo (e.g. creatin -> creatine distance = 1)

  for (const dbWord of dbWords) {
    // Only attempt corrections on words roughly the same length to avoid straying
    if (Math.abs(dbWord.length - lastWord.length) <= 2) {
      const distance = getLevenshteinDistance(lastWord, dbWord);
      
      if (distance > 0 && distance < minDistance) {
        minDistance = distance;
        bestMatch = dbWord;
      }
    }
  }

  if (bestMatch) {
    words[words.length - 1] = bestMatch;
    return words.join(' '); // Returns the entire queried phrasing but with autocorrected last word!
  }
  return null;
};
