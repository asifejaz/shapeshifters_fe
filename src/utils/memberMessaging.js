import { normalizePakistanPhone, whatsappUrl } from './whatsapp';

const dateOnly = (value) => String(value || '').split('T')[0];

const parseDate = (value) => {
  const [year, month, day] = dateOnly(value).split('-').map(Number);
  return year && month && day ? new Date(year, month - 1, day) : null;
};

const displayDate = (value) => {
  const date = value instanceof Date ? value : parseDate(value);
  return date
    ? new Intl.DateTimeFormat('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
    : '';
};

const dueStatus = (subscriptionEnd) => {
  const endDate = parseDate(subscriptionEnd);
  if (!endDate) return '';

  const dueDate = new Date(endDate);
  dueDate.setDate(dueDate.getDate() + 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pendingDays = Math.floor((today - dueDate) / 86400000);

  if (pendingDays > 0) {
    return ` Your fee has been pending for ${pendingDays} ${pendingDays === 1 ? 'day' : 'days'} since ${displayDate(dueDate)}.`;
  }

  if (pendingDays === 0) return ' Your fee is due today.';
  return ` Your fee will be due on ${displayDate(dueDate)}.`;
};

export function hasPendingFee(subscriber) {
  if (!subscriber?.phone || subscriber.status === 'inactive') return false;

  const endDate = parseDate(subscriber.subscription_end);
  if (!endDate) return false;

  const dueDate = new Date(endDate);
  dueDate.setDate(dueDate.getDate() + 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today >= dueDate;
}

export function feeReminderMessage(subscriber) {
  const name = String(subscriber?.name || 'Member').trim();
  const amount = Number(subscriber?.fee_amount || 0);
  const fee = amount > 0 ? ` of Rs. ${amount.toLocaleString('en-PK')}` : '';

  return `Dear ${name}, this is a friendly reminder from Shape Shifters Gym that your monthly membership fee${fee} is due.${dueStatus(subscriber?.subscription_end)} Please visit the gym to renew your membership. Thank you.`;
}

export function memberWhatsappUrl(subscriber) {
  return whatsappUrl(subscriber?.phone, feeReminderMessage(subscriber));
}

export function memberSmsUrl(subscriber) {
  const phone = normalizePakistanPhone(subscriber?.phone);
  if (!phone) return '#';

  return `sms:${phone}?body=${encodeURIComponent(feeReminderMessage(subscriber))}`;
}
