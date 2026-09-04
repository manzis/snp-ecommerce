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

/**
 * Converts any date string (ISO UTC, ISO with offset, or local date string)
 * into a standardized Nepal (Asia/Kathmandu) local date string "YYYY-MM-DD HH:mm:ss".
 */
export function formatToKathmanduTime(rawDateStr?: string): string {
  if (!rawDateStr || typeof rawDateStr !== 'string') {
    return formatPartsToKathmandu(new Date());
  }

  const str = rawDateStr.trim();
  
  // If the date string has ISO indicators ('Z', '+', or 'T' with time offset)
  if (str.includes('Z') || str.includes('+') || (str.includes('T') && str.length >= 19)) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return formatPartsToKathmandu(d);
    }
  }

  // If it's a plain string like "2026-09-04 17:57:00", clean any residual T/Z
  return str.replace('T', ' ').replace('Z', '').split('.')[0];
}

function formatPartsToKathmandu(d: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kathmandu',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(d);
  
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '00';
  return `${getPart('year')}-${getPart('month')}-${getPart('day')} ${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;
}

