export function normalizePakistanPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('0')) return `92${digits.slice(1)}`;
  if (digits.startsWith('3') && digits.length === 10) return `92${digits}`;

  return digits;
}

export function whatsappUrl(phone, message = 'Hello Shape Shifters, I would like to get more information.') {
  const normalized = normalizePakistanPhone(phone);
  if (!normalized) return '#';

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
