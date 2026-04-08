import mongoose, { type HydratedDocument, type Types } from 'mongoose';

interface ActivityAttributes {
    action: string;
    userId: Types.ObjectId;
    ticketId: Types.ObjectId;
    createdAt: Date;
}

type ActivityDocument = HydratedDocument<ActivityAttributes>;

const activitySchema = new mongoose.Schema<ActivityAttributes>({
    action: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Activity = mongoose.model<ActivityAttributes>('Activity', activitySchema);

export { Activity };
export type { ActivityAttributes, ActivityDocument };
