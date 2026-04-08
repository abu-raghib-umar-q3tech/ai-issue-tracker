import type { Request, Response } from 'express';
import { listUsers, type UserSummary } from '../services/user.service.js';
import type { MessageResponse } from '../types/http.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getUsersHandler = asyncHandler(
    async (
        req: Request<{}, UserSummary[] | MessageResponse, never>,
        res: Response<UserSummary[] | MessageResponse>
    ): Promise<void> => {
        if (!req.user?.sub) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        const users = await listUsers();
        res.status(200).json(users);
    }
);

export { getUsersHandler };
