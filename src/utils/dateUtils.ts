/**
 * Formats a date string or Date object into a relative time string (e.g., "2 days ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
  const diffInMonths = Math.floor(daysBetween(now, past) / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  
  return `${Math.floor(diffInMonths / 12)}y ago`;
}

function daysBetween(d1: Date, d2: Date): number {
  return Math.abs(Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24)));
}
