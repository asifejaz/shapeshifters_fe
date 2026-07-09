const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const monthFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
});

const parseDateValue = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string') {
    const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnly) {
      const [, year, month, day] = dateOnly;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatDisplayDate = (value, fallback = '-') => {
  const date = parseDateValue(value);
  return date ? dateFormatter.format(date) : fallback;
};

export const formatDisplayDateTime = (value, fallback = '-') => {
  const date = parseDateValue(value);
  return date ? dateTimeFormatter.format(date).replace(',', '') : fallback;
};

export const formatDisplayMonth = (value, fallback = '-') => {
  if (!value) return fallback;
  const normalized = typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)
    ? `${value}-01`
    : value;
  const date = parseDateValue(normalized);
  return date ? monthFormatter.format(date) : fallback;
};
