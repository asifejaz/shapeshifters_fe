import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { toTitleCaseDisplay } from '../utils/textFormat';

export default function SubscriberNewTabLink({ subscriber, className = '' }) {
  if (!subscriber?.id) return <span className={className}>{toTitleCaseDisplay(subscriber?.name) || '—'}</span>;

  return (
    <Link
      to={`/admin/subscribers/${subscriber.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 hover:text-blue-600 hover:underline ${className}`}
      title="Open member details in a new tab"
    >
      {toTitleCaseDisplay(subscriber.name)}
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
    </Link>
  );
}
