import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AiBadge } from '../components/ui/AiBadge';
import { ApiErrorAlert } from '../components/ui/ApiErrorAlert';
import { TicketPriorityBadge } from '../features/tickets/priorityUi';
import { useCreateTicketMutation } from '../features/tickets/ticketsApi';
import type { CreateTicketRequest, Ticket, TicketPriority } from '../features/tickets/types';

interface CreateIssueFormState {
  title: string;
  description: string;
}

interface TicketAiSummary {
  title: string;
  priority: TicketPriority;
  tags: string[];
  estimatedTime: string;
}

interface AiInsightCardProps {
  label: string;
  className?: string;
  children: ReactNode;
}

const initialForm: CreateIssueFormState = {
  title: '',
  description: ''
};

const toAiSummary = (ticket: Ticket): TicketAiSummary => ({
  title: ticket.title,
  priority: ticket.priority,
  tags: ticket.tags,
  estimatedTime: ticket.estimatedTime
});

const AiInsightCard = ({ label, className = '', children }: AiInsightCardProps) => {
  return (
    <div
      className={[
        'rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-4 shadow-sm',
        className
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">{label}</p>
          <p className="mt-1 text-xs font-medium text-sky-600">AI Suggested</p>
        </div>
        <AiBadge label="AI" compact />
      </div>

      <div className="mt-3">{children}</div>
    </div>
  );
};

const CreateIssuePage = () => {
  const [form, setForm] = useState<CreateIssueFormState>(initialForm);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<TicketAiSummary | null>(null);
  const [createTicket, { isLoading, isError, error }] = useCreateTicketMutation();

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(null);
    setAiSummary(null);

    const payload: CreateTicketRequest = {
      title: form.title.trim(),
      description: form.description.trim()
    };

    try {
      const createdTicket = await createTicket(payload).unwrap();

      setForm(initialForm);
      setSuccessMessage('Issue created successfully. AI analysis is shown below.');
      setAiSummary(toAiSummary(createdTicket));
    } catch (_requestError: unknown) {
      // API error is already exposed via RTK Query state.
    }
  };

  return (
    <section className="page-stack">
      <header className="hero-strip space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">AI-Powered Intake</p>
        <h1 className="app-heading">Create Issue</h1>
        <p className="app-subheading">Describe the issue once and let AI generate priority, tags, and estimated time.</p>
      </header>

      <form className="app-panel app-form" onSubmit={handleSubmit}>
        <fieldset disabled={isLoading} className="space-y-5 border-0 p-0 m-0 min-w-0">
          <div className="app-form-group">
            <label className="app-label" htmlFor="title">
              Title
            </label>
            <input
              required
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="app-input"
              placeholder="Short issue title"
            />
          </div>

          <div className="app-form-group">
            <label className="app-label" htmlFor="description">
              Description
            </label>
            <textarea
              required
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="app-textarea"
              placeholder="Describe the bug or feature in detail so AI can estimate better"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                  AI is analyzing...
                </>
              ) : (
                'Create Issue with AI'
              )}
            </button>
          </div>
        </fieldset>

        {isError ? <ApiErrorAlert error={error} fallbackMessage="Failed to create issue." /> : null}
      </form>

      {successMessage && aiSummary ? (
        <section className="app-panel space-y-4 border-sky-200 bg-gradient-to-br from-sky-50/90 via-white to-cyan-50/80">
          <p className="text-sm font-medium text-emerald-800">{successMessage}</p>

          <article className="app-surface border border-sky-200 bg-white/90 p-4 backdrop-blur-sm md:p-5">
            <div className="flex flex-col gap-4 border-b border-sky-100 pb-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <AiBadge />
                <div>
                  <h2 className="app-card-title">{aiSummary.title}</h2>
                  <p className="app-description mt-1">
                    These suggestions were generated from your issue description to speed up triage.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <AiInsightCard label="Priority">
                <div className="mt-1">
                  <TicketPriorityBadge priority={aiSummary.priority} />
                </div>
              </AiInsightCard>

              <AiInsightCard label="Tags" className="md:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {aiSummary.tags.length ? (
                    aiSummary.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-sky-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-sky-800 shadow-sm"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="app-meta-text">No tags generated</span>
                  )}
                </div>
              </AiInsightCard>

              <AiInsightCard label="Estimated Time" className="md:col-span-3">
                <div className="inline-flex items-center rounded-2xl border border-sky-200 bg-white/95 px-4 py-3 text-base font-bold text-slate-900 shadow-sm">
                  {aiSummary.estimatedTime}
                </div>
              </AiInsightCard>
            </div>
          </article>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/issues" className="btn-primary">
              Go to Issues List
            </Link>
            <button
              type="button"
              onClick={() => {
                setSuccessMessage(null);
                setAiSummary(null);
              }}
              className="btn-secondary"
            >
              Create Another
            </button>
          </div>
        </section>
      ) : null}
    </section>
  );
};

export { CreateIssuePage };
