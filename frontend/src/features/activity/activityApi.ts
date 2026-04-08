import { baseApi } from '../../services/baseApi';
import type { Activity } from './types';

const activityApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getActivity: builder.query<Activity[], string>({
            query: (ticketId) => `/activity/${ticketId}`,
            providesTags: (_result, _error, ticketId) => [{ type: 'Activity', id: ticketId }]
        })
    })
});

export const { useGetActivityQuery } = activityApi;
