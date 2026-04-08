import { User } from '../models/user.model.js';

interface UserSummary {
    id: string;
    name: string;
    email: string;
}

const listUsers = async (): Promise<UserSummary[]> => {
    const users = await User.find({}, 'name email').sort({ name: 1 }).lean().exec();

    return users.map((u) => ({
        id: (u._id as { toString(): string }).toString(),
        name: u.name,
        email: u.email
    }));
};

export { listUsers };
export type { UserSummary };
