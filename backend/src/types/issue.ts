export const ISSUE_STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export const ISSUE_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];

export interface IssueQuery {
  status?: IssueStatus;
  priority?: IssuePriority;
}

export interface CreateIssuePayload {
  title: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
}

export interface UpdateIssuePayload {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
}

export interface IssueRouteParams {
  id: string;
}

export const isIssueStatus = (value: unknown): value is IssueStatus => {
  return typeof value === 'string' && ISSUE_STATUSES.includes(value as IssueStatus);
};

export const isIssuePriority = (value: unknown): value is IssuePriority => {
  return typeof value === 'string' && ISSUE_PRIORITIES.includes(value as IssuePriority);
};
