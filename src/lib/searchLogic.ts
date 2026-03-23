
const getLevenshteinDistance = (a: string, b: string): number => {
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

export const performSearch = (query: string, products: any[]) => {
  const rawQuery = query.toLowerCase().trim();
  if (!rawQuery) return [];

  // Split query into tokens (e.g., "atom", "whey", "protein", "1", "kg")
  const queryTokens = rawQuery.split(/\s+/);

  return products
    .map((product) => {
      let score = 0;
      const title = product.name.toLowerCase();
      const brand = product.brand.toLowerCase();
      const titleTokens = title.split(/\s+/);

      // 1. EXACT PHRASE MATCH (Priority 1)
      // "atom whey protein" found exactly inside "atom whey protein concentrate"
      if (title.includes(rawQuery)) {
        score += 1000;
      }

      // 2. TOKEN MATCHING (Priority 2)
      // Check how many words from the query exist in the title
      let matchedTokensCount = 0;
      let lastFoundIndex = -1;
      let sequentialBonus = 0;

      queryTokens.forEach((qToken) => {
        const foundIndex = titleTokens.findIndex((tToken: string) => tToken === qToken);
        
        if (foundIndex !== -1) {
          matchedTokensCount++;
          score += 100; // 100 points per exact word match

          // Sequential match bonus (words appearing in the same order as typed)
          if (foundIndex > lastFoundIndex) {
            sequentialBonus += 50;
          }
          lastFoundIndex = foundIndex;
        } else {
          // 3. FUZZY MATCH PER TOKEN (Typo Tolerance)
          // If word doesn't match exactly, check if it's a typo
          titleTokens.forEach((tToken: string) => {
            if (qToken.length > 3 && tToken.length > 3) {
              const distance = getLevenshteinDistance(qToken, tToken);
              if (distance <= 1) score += 40; // High similarity
              else if (distance === 2) score += 10; // Moderate similarity
            }
          });
        }
      });

      // Boost score based on percentage of query words matched
      const matchPercentage = matchedTokensCount / queryTokens.length;
      score += (matchPercentage * 200) + sequentialBonus;

      // 4. BRAND BOOST
      if (brand.includes(rawQuery) || queryTokens.some(q => brand.includes(q))) {
        score += 150;
      }

      return { ...product, searchScore: score };
    })
    .filter((p) => p.searchScore > 50) // Threshold to remove irrelevant noise
    .sort((a, b) => b.searchScore - a.searchScore);
};