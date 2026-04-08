import { Types } from 'mongoose';
import { Activity, type ActivityDocument } from '../models/activity.model.js';
import type { AppError } from '../types/http.js';

const makeAppError = (message: string, statusCode: number): AppError => {
    const error: AppError = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const getActivityByTicket = async (ticketId: string): Promise<ActivityDocument[]> => {
    if (!Types.ObjectId.isValid(ticketId)) {
        throw makeAppError('Invalid ticketId', 400);
    }

    const activities = await Activity.find({ ticketId: new Types.ObjectId(ticketId) })
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .exec();

    return activities;
};

export { getActivityByTicket };
