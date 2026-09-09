import { useState } from 'react';
import { ChevronDown, MessageCircle, MessageSquare } from 'lucide-react';
import { hasPendingFee, memberSmsUrl, memberWhatsappUrl } from '../utils/memberMessaging';

export default function FeeReminderActions({ subscriber, compact = false }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!hasPendingFee(subscriber)) return null;

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white font-medium text-sky-700 hover:bg-sky-50 ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}
      >
        <MessageCircle className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        Fee Reminder
        <ChevronDown className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
          <a
            href={memberWhatsappUrl(subscriber)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          <a
            href={memberSmsUrl(subscriber)}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700"
          >
            <MessageSquare className="h-4 w-4" /> SMS
          </a>
        </div>
      )}
    </div>
  );
}
