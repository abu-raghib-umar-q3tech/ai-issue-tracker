import { Router } from 'express';
import {
  createIssueHandler,
  deleteIssueHandler,
  getIssueByIdHandler,
  getIssuesHandler,
  updateIssueHandler
} from '../controllers/issue.controller.js';
import { authenticateUser } from '../middleware/authenticateUser.js';

const issueRouter = Router();

issueRouter.get('/', getIssuesHandler);
issueRouter.get('/:id', getIssueByIdHandler);
issueRouter.post('/', authenticateUser, createIssueHandler);
issueRouter.patch('/:id', authenticateUser, updateIssueHandler);
issueRouter.delete('/:id', authenticateUser, deleteIssueHandler);

export { issueRouter };
