import type { Request, Response } from 'express';
import type { ActivityDocument } from '../models/activity.model.js';
import { getActivityByTicket } from '../services/activity.service.js';
import type { MessageResponse } from '../types/http.js';
import { asyncHandler } from '../utils/asyncHandler.js';

interface ActivityRouteParams {
    ticketId: string;
}

const getActivityHandler = asyncHandler(
    async (
        req: Request<ActivityRouteParams, ActivityDocument[] | MessageResponse, never>,
        res: Response<ActivityDocument[] | MessageResponse>
    ): Promise<void> => {
        if (!req.user?.sub) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        const activities = await getActivityByTicket(req.params.ticketId);
        res.status(200).json(activities);
    }
);

export { getActivityHandler };
