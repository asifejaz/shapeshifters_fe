export function whatsappUrl(phone, message = 'Hello Shape Shifters, I would like to get more information.') {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '#';

  const normalized = digits.startsWith('0') ? `92${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
