import type { FilterQuery } from 'mongoose';
import { Issue, type IssueDocument, type IssueModel } from '../models/issue.model.js';
import type { CreateIssuePayload, IssueQuery, UpdateIssuePayload } from '../types/issue.js';

const listIssues = async (query: IssueQuery = {}): Promise<IssueDocument[]> => {
  const filter: FilterQuery<IssueModel> = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.priority) {
    filter.priority = query.priority;
  }

  const issues = await Issue.find(filter).sort({ createdAt: -1 }).exec();
  return issues;
};

const getIssueById = async (id: string): Promise<IssueDocument | null> => {
  const issue = await Issue.findById(id).exec();
  return issue;
};

const createIssue = async (payload: CreateIssuePayload): Promise<IssueDocument> => {
  const issue = await Issue.create({
    title: payload.title,
    description: payload.description,
    priority: payload.priority,
    status: payload.status
  });

  return issue;
};

const updateIssueById = async (id: string, payload: UpdateIssuePayload): Promise<IssueDocument | null> => {
  const issue = await Issue.findByIdAndUpdate(
    id,
    {
      title: payload.title,
      description: payload.description,
      priority: payload.priority,
      status: payload.status
    },
    {
      new: true,
      runValidators: true
    }
  ).exec();

  return issue;
};

const deleteIssueById = async (id: string): Promise<IssueDocument | null> => {
  const issue = await Issue.findByIdAndDelete(id).exec();
  return issue;
};

export { createIssue, deleteIssueById, getIssueById, listIssues, updateIssueById };
