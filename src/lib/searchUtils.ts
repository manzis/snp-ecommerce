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

export const getAutocorrectSuggestion = (query: string, database: string[]): string | null => {
  const words = query.toLowerCase().split(/\s+/);
  const lastWord = words[words.length - 1];
  if (lastWord.length < 3) return null;

  // Extract all unique words from database to find the closest match
  const dbWords = Array.from(new Set(database.flatMap(item => item.toLowerCase().split(/\s+/))));
  
  let bestMatch = null;
  let minDistance = 3; // Max threshold for a typo

  for (const dbWord of dbWords) {
    const distance = getLevenshteinDistance(lastWord, dbWord);
    if (distance > 0 && distance < minDistance) {
      minDistance = distance;
      bestMatch = dbWord;
    }
  }

  if (bestMatch) {
    words[words.length - 1] = bestMatch;
    return words.join(' ');
  }
  return null;
};