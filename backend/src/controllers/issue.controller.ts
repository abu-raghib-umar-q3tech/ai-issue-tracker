import type { Request, Response } from 'express';
import {
  createIssue,
  deleteIssueById,
  getIssueById,
  listIssues,
  updateIssueById
} from '../services/issue.service.js';
import type { MessageResponse } from '../types/http.js';
import {
  isIssuePriority,
  isIssueStatus,
  type CreateIssuePayload,
  type IssueRouteParams,
  type UpdateIssuePayload
} from '../types/issue.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { IssueDocument } from '../models/issue.model.js';

interface ListIssuesQuery {
  status?: string;
  priority?: string;
}

type IssueResponse = IssueDocument | MessageResponse;

const getIssuesHandler = asyncHandler(
  async (
    req: Request<{}, IssueDocument[], never, ListIssuesQuery>,
    res: Response<IssueDocument[]>
  ): Promise<void> => {
    const issues = await listIssues({
      status: isIssueStatus(req.query.status) ? req.query.status : undefined,
      priority: isIssuePriority(req.query.priority) ? req.query.priority : undefined
    });

    res.status(200).json(issues);
  }
);

const getIssueByIdHandler = asyncHandler(
  async (req: Request<IssueRouteParams>, res: Response<IssueResponse>): Promise<void> => {
    const issue = await getIssueById(req.params.id);

    if (!issue) {
      res.status(404).json({ message: 'Issue not found' });
      return;
    }

    res.status(200).json(issue);
  }
);

const createIssueHandler = asyncHandler(
  async (req: Request<{}, IssueDocument, CreateIssuePayload>, res: Response<IssueDocument>): Promise<void> => {
    const issue = await createIssue(req.body);
    res.status(201).json(issue);
  }
);

const updateIssueHandler = asyncHandler(
  async (
    req: Request<IssueRouteParams, IssueResponse, UpdateIssuePayload>,
    res: Response<IssueResponse>
  ): Promise<void> => {
    const issue = await updateIssueById(req.params.id, req.body);

    if (!issue) {
      res.status(404).json({ message: 'Issue not found' });
      return;
    }

    res.status(200).json(issue);
  }
);

const deleteIssueHandler = asyncHandler(
  async (req: Request<IssueRouteParams>, res: Response<MessageResponse>): Promise<void> => {
    const deleted = await deleteIssueById(req.params.id);

    if (!deleted) {
      res.status(404).json({ message: 'Issue not found' });
      return;
    }

    res.status(204).send();
  }
);

export {
  createIssueHandler,
  deleteIssueHandler,
  getIssueByIdHandler,
  getIssuesHandler,
  updateIssueHandler
};
