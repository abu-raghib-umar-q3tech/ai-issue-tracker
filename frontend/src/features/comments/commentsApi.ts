import { showErrorToast } from '../../components/ui/toast';
import { getRtkQueryErrorMessage } from '../../types/api';
import { baseApi } from '../../services/baseApi';
import type { Comment, CreateCommentRequest } from './types';

const commentsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getComments: builder.query<Comment[], string>({
            query: (ticketId) => `/comments/${ticketId}`,
            providesTags: (_result, _error, ticketId) => [{ type: 'Comments', id: ticketId }]
        }),
        createComment: builder.mutation<Comment, CreateCommentRequest>({
            query: (payload) => ({
                url: '/comments',
                method: 'POST',
                body: payload
            }),
            invalidatesTags: (_result, _error, { ticketId }) => [
                { type: 'Comments', id: ticketId },
                { type: 'Activity', id: ticketId }
            ],
            async onQueryStarted(_payload, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (error: unknown) {
                    showErrorToast(getRtkQueryErrorMessage(error, 'Failed to post comment.'));
                }
            }
        })
    })
});

export const { useGetCommentsQuery, useCreateCommentMutation } = commentsApi;
