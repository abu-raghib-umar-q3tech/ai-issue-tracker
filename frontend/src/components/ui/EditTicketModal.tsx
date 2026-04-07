import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AiBadge } from './AiBadge';
import { getRtkQueryErrorMessage } from '../../types/api';
import type { Ticket, TicketPriority, UpdateTicketRequest } from '../../features/tickets/types';

type EditableField = 'priority' | 'tags' | 'estimatedTime';

interface Draft {
  priority: TicketPriority;
  tags: string;
  estimatedTime: string;
  touched: Set<EditableField>;
}

interface EditTicketModalProps {
  ticket: Ticket;
  onClose: () => void;
  onSave: (data: UpdateTicketRequest) => Promise<void>;
}

const EditTicketModal = ({ ticket, onClose, onSave }: EditTicketModalProps) => {
  const [draft, setDraft] = useState<Draft>(() => ({
    priority: ticket.priority,
    tags: ticket.tags.join(', '),
    estimatedTime: ticket.estimatedTime,
    touched: new Set<EditableField>()
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isSaving, onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleFieldChange = (field: EditableField, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
      touched: new Set([...prev.touched, field])
    }));
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current && !isSaving) onClose();
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave({
        priority: draft.priority,
        tags: draft.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        estimatedTime: draft.estimatedTime.trim()
      });
    } catch (err: unknown) {
      setSaveError(getRtkQueryErrorMessage(err, 'Failed to save changes.'));
      setIsSaving(false);
    }
  };

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-400">Edit AI-Generated Fields</p>
            <h2 id="edit-modal-title" className="mt-1 truncate text-lg font-semibold tracking-tight text-slate-900">
              {ticket.title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            className="flex-none rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed"
            disabled={isSaving}
            onClick={onClose}
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {saveError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {saveError}
            </p>
          ) : null}

          {/* Priority */}
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <label htmlFor="modal-priority" className="app-label mb-0">
                Priority
              </label>
              {!draft.touched.has('priority') ? <AiBadge compact /> : null}
            </div>
            <select
              id="modal-priority"
              className="app-select"
              value={draft.priority}
              onChange={(e) => handleFieldChange('priority', e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Estimated Time */}
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <label htmlFor="modal-eta" className="app-label mb-0">
                Estimated Time
              </label>
              {!draft.touched.has('estimatedTime') ? <AiBadge compact /> : null}
            </div>
            <input
              id="modal-eta"
              type="text"
              className="app-input"
              placeholder="e.g. 2-4 hours"
              value={draft.estimatedTime}
              onChange={(e) => handleFieldChange('estimatedTime', e.target.value)}
            />
          </div>

          {/* Tags */}
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <label htmlFor="modal-tags" className="app-label mb-0">
                Tags
              </label>
              {!draft.touched.has('tags') ? <AiBadge compact /> : null}
            </div>
            <input
              id="modal-tags"
              type="text"
              className="app-input"
              placeholder="bug, ui, backend"
              value={draft.tags}
              onChange={(e) => handleFieldChange('tags', e.target.value)}
            />
            <p className="mt-1.5 text-xs text-slate-400">Separate tags with commas</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            className="btn-secondary"
            disabled={isSaving}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export { EditTicketModal };
