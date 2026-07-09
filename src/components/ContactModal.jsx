import { useState } from 'react';
import { X } from 'lucide-react';
import ContactForm from './ContactForm';

export default function ContactModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[oklch(0.12_0.01_40/0.98)] border border-[var(--forge-border)] rounded-2xl shadow-ember overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--forge-border)]">
          <h3 className="text-lg font-bold uppercase tracking-wider" style={{ fontFamily: 'Orbitron, system-ui' }}>
            Get in Touch
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--forge-muted)] hover:text-[var(--forge-fg)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <ContactForm inline onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
}
