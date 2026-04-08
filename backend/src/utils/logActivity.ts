import { Types } from 'mongoose';
import { Activity } from '../models/activity.model.js';

const logActivity = async (userId: string, ticketId: string, action: string): Promise<void> => {
    try {
        await Activity.create({
            action,
            userId: new Types.ObjectId(userId),
            ticketId: new Types.ObjectId(ticketId)
        });
    } catch {
        // Activity logging is non-critical; never let it break the caller
    }
};

export { logActivity };
