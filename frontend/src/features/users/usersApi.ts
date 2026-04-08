import { baseApi } from '../../services/baseApi';
import type { User } from './types';

const usersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query<User[], void>({
            query: () => '/users'
        })
    })
});

export const { useGetUsersQuery } = usersApi;
