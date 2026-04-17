import { Product } from '@/services/productService';
import { getLevenshteinDistance } from './searchUtils';

export const performSearch = (query: string, products: Product[]) => {
  const rawQuery = query.toLowerCase().trim();
  if (!rawQuery) return [];

  const queryTokens = rawQuery.split(/\s+/);

  return products
    .map((product) => {
      let score = 0;
      
      const name = product.name?.toLowerCase() || '';
      const title = product.title?.toLowerCase() || ''; // Used as "Display Name"
      const brand = product.brands?.name?.toLowerCase() || '';
      const category = product.categories?.name?.toLowerCase() || '';
      const tags = (product.tags || []).map(t => t.toLowerCase());

      const nameTokens = name.split(/\s+/);
      const titleTokens = title.split(/\s+/);
      const allTextTokens = Array.from(new Set([...nameTokens, ...titleTokens]));

      // 1. EXACT PHRASE MATCHES (Highest Priority)
      // E.g. "muscleblaze whey" exactly in the name or display name
      if (name.includes(rawQuery) || title.includes(rawQuery)) {
        score += 1000;
        // Even bigger boost if it matches name *exactly*
        if (name === rawQuery || title === rawQuery) {
          score += 500;
        }
      }

      // 2. BRAND PHRASE MATCH (Priority 2)
      // E.g. User types "muscleblaze" exactly. Give strong priority to all muscleblaze products
      if (brand === rawQuery) {
        score += 800;
      } else if (brand && rawQuery.includes(brand)) {
        score += 500;
      } else if (brand && brand.includes(rawQuery)) {
        score += 300;
      }

      // 3. TARGETED TAG & CATEGORY MATCH
      if (tags.some(t => t.includes(rawQuery))) {
        score += 300; // Found exact word in tags array
      }
      if (category && category.includes(rawQuery)) {
        score += 200; // E.g. typed "protein"
      }

      // 4. TOKENIZED MATCHING LOOP (Handling typos, sequence, and partial matches)
      let matchedTokensCount = 0;
      let lastFoundIndex = -1;
      let sequentialBonus = 0;

      queryTokens.forEach((qToken) => {
        // Did they type exactly a brand word or a category word?
        if (brand.includes(qToken)) score += 150;
        if (category.includes(qToken)) score += 100;
        if (tags.some(t => t === qToken)) score += 150;
        else if (tags.some(t => getLevenshteinDistance(t, qToken) <= 1)) score += 50;

        // Find against the combined name & title token array
        const exactFoundIndex = allTextTokens.findIndex((tToken: string) => tToken === qToken);

        if (exactFoundIndex !== -1) {
          matchedTokensCount++;
          score += 100; // 100 points per exact word match

          // Sequential match bonus (words appearing in the same order as typed)
          if (exactFoundIndex > lastFoundIndex) {
            sequentialBonus += 50;
          }
          lastFoundIndex = exactFoundIndex;
        } else {
          // 4B. FUZZY MATCH PER TOKEN (Typo Tolerance)
          allTextTokens.forEach((tToken: string) => {
            if (qToken.length >= 3 && tToken.length >= 3) {
              const distance = getLevenshteinDistance(qToken, tToken);
              if (distance === 1) score += 40;     // High similarity (1 letter typo)
              else if (distance === 2) score += 10; // Moderate similarity (2 letter typo)
            }
          });
        }
      });

      // Boost score based on percentage of query words matched
      const matchPercentage = matchedTokensCount / queryTokens.length;
      score += Math.round(matchPercentage * 200) + sequentialBonus;

      return { ...product, searchScore: score };
    })
    .filter((p) => p.searchScore > 50) // Threshold to remove irrelevant noise
    .sort((a, b) => b.searchScore - a.searchScore);
};