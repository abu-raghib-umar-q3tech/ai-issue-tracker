import mongoose, { type HydratedDocument } from 'mongoose';
import { ISSUE_PRIORITIES, ISSUE_STATUSES, type IssuePriority, type IssueStatus } from '../types/issue.js';

interface IssueModel {
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
}

type IssueDocument = HydratedDocument<IssueModel>;

const issueSchema = new mongoose.Schema<IssueModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ISSUE_STATUSES,
      default: 'open'
    },
    priority: {
      type: String,
      enum: ISSUE_PRIORITIES,
      default: 'medium'
    }
  },
  {
    timestamps: true
  }
);

const Issue = mongoose.model<IssueModel>('Issue', issueSchema);

export { Issue };
export type { IssueDocument, IssueModel };
