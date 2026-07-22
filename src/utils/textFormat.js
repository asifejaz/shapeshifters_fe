const SMALL_WORDS = new Set(['bin', 'bint', 'ibn']);

const titleCasePart = (part, index) => {
  if (!part) return part;
  const lower = part.toLowerCase();
  if (index > 0 && SMALL_WORDS.has(lower)) return lower;
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export const toTitleCase = (value = '') => String(value)
  .replace(/\s+/g, ' ')
  .split(' ')
  .map((word) => word
    .split('-')
    .map((part, index) => titleCasePart(part, index))
    .join('-'))
  .join(' ');

export const toTitleCaseDisplay = (value, fallback = '-') => {
  if (!value) return fallback;
  return toTitleCase(value).trim() || fallback;
};
