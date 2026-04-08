export interface ActivityUser {
    _id: string;
    name: string;
}

export interface Activity {
    _id: string;
    action: string;
    userId: ActivityUser;
    ticketId: string;
    createdAt: string;
}
