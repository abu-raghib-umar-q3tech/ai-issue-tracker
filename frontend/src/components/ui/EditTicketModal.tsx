import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAnalyzeTicketMutation } from '../../features/tickets/ticketsApi';
import type { Ticket, TicketPriority, UpdateTicketRequest } from '../../features/tickets/types';
import { getRtkQueryErrorMessage } from '../../types/api';
import { AiBadge } from './AiBadge';

type AiField = 'priority' | 'tags' | 'estimatedTime';

interface Draft {
  title: string;
  description: string;
  priority: TicketPriority;
  tags: string;
  estimatedTime: string;
  aiTouched: Set<AiField>;
}

interface EditTicketModalProps {
  ticket: Ticket;
  onClose: () => void;
  onSave: (data: UpdateTicketRequest) => Promise<void>;
}

const EditTicketModal = ({ ticket, onClose, onSave }: EditTicketModalProps) => {
  const [draft, setDraft] = useState<Draft>(() => ({
    title: ticket.title,
    description: ticket.description,
    priority: ticket.priority,
    tags: ticket.tags.join(', '),
    estimatedTime: ticket.estimatedTime,
    aiTouched: new Set<AiField>()
  }));
  const [analyzeTicket] = useAnalyzeTicketMutation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const canReanalyze =
    draft.title.trim() !== ticket.title || draft.description.trim() !== ticket.description;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving && !isAnalyzing) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isAnalyzing, isSaving, onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleChange = (field: 'title' | 'description', value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleAiFieldChange = (field: AiField, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
      aiTouched: new Set([...prev.aiTouched, field])
    }));
  };

  const handleReanalyze = async () => {
    setIsAnalyzing(true);
    setAnalyzeError(null);
    try {
      const result = await analyzeTicket({
        title: draft.title.trim(),
        description: draft.description.trim()
      }).unwrap();
      setDraft((prev) => ({
        ...prev,
        priority: result.priority,
        estimatedTime: result.estimatedTime,
        tags: result.tags.join(', '),
        aiTouched: new Set<AiField>()
      }));
    } catch (err: unknown) {
      setAnalyzeError(getRtkQueryErrorMessage(err, 'AI analysis failed. Please try again.'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current && !isSaving && !isAnalyzing) onClose();
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave({
        title: draft.title.trim(),
        description: draft.description.trim(),
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
        className="flex w-full max-w-xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex flex-none items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-400">Edit Ticket</p>
            <h2 id="edit-modal-title" className="mt-0.5 text-lg font-semibold tracking-tight text-slate-900">
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
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {saveError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {saveError}
            </p>
          ) : null}

          {/* Title */}
          <div>
            <label htmlFor="modal-title" className="app-label">
              Title
            </label>
            <input
              id="modal-title"
              type="text"
              className="app-input"
              placeholder="Issue title"
              value={draft.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="modal-description" className="app-label">
              Description
            </label>
            <textarea
              id="modal-description"
              className="app-textarea"
              placeholder="Describe the issue..."
              rows={4}
              value={draft.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-100" />
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-400">AI-Generated Fields</p>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          {/* Re-analyze */}
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-2.5">
              <p className="text-xs text-slate-500">
                {canReanalyze
                  ? 'Re-run AI analysis with your updated title & description.'
                  : 'Edit the title or description above to re-run AI analysis.'}
              </p>
              <button
                type="button"
                disabled={!canReanalyze || isSaving || isAnalyzing}
                onClick={handleReanalyze}
                className="ml-3 inline-flex flex-none items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Re-analyze with AI
                  </>
                )}
              </button>
            </div>
            {analyzeError ? (
              <p className="text-xs font-medium text-red-600">{analyzeError}</p>
            ) : null}
          </div>

          {/* Priority */}
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <label htmlFor="modal-priority" className="app-label mb-0">
                Priority
              </label>
              {!draft.aiTouched.has('priority') ? <AiBadge compact /> : null}
            </div>
            <select
              id="modal-priority"
              className="app-select"
              value={draft.priority}
              disabled={isAnalyzing}
              onChange={(e) => handleAiFieldChange('priority', e.target.value)}
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
              {!draft.aiTouched.has('estimatedTime') ? <AiBadge compact /> : null}
            </div>
            <input
              id="modal-eta"
              type="text"
              className="app-input"
              placeholder="e.g. 2-4 hours"
              value={draft.estimatedTime}
              disabled={isAnalyzing}
              onChange={(e) => handleAiFieldChange('estimatedTime', e.target.value)}
            />
          </div>

          {/* Tags */}
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <label htmlFor="modal-tags" className="app-label mb-0">
                Tags
              </label>
              {!draft.aiTouched.has('tags') ? <AiBadge compact /> : null}
            </div>
            <input
              id="modal-tags"
              type="text"
              className="app-input"
              placeholder="bug, ui, backend"
              value={draft.tags}
              disabled={isAnalyzing}
              onChange={(e) => handleAiFieldChange('tags', e.target.value)}
            />
            <p className="mt-1.5 text-xs text-slate-400">Separate tags with commas</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-none items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            className="btn-secondary"
            disabled={isSaving || isAnalyzing}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={isSaving || isAnalyzing}
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
