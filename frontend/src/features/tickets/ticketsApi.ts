import { showErrorToast, showSuccessToast } from '../../components/ui/toast';
import { getRtkQueryErrorMessage } from '../../types/api';
import { baseApi } from '../../services/baseApi';
import type {
  AnalyzeTicketRequest,
  CreateTicketRequest,
  GetTicketsParams,
  GetTicketsResponse,
  Ticket,
  TicketAnalysisResult,
  UpdateTicketPayload
} from './types';

const buildTicketsQuery = (params: GetTicketsParams | void): string => {
  if (!params) {
    return '/tickets';
  }

  const searchParams = new URLSearchParams();

  if (typeof params.page === 'number') {
    searchParams.set('page', String(params.page));
  }

  if (typeof params.limit === 'number') {
    searchParams.set('limit', String(params.limit));
  }

  if (params.status) {
    searchParams.set('status', params.status);
  }

  if (params.priority) {
    searchParams.set('priority', params.priority);
  }

  if (params.search) {
    searchParams.set('search', params.search);
  }

  const search = searchParams.toString();
  return search ? `/tickets?${search}` : '/tickets';
};

const ticketsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<GetTicketsResponse, GetTicketsParams | void>({
      query: (params) => buildTicketsQuery(params),
      providesTags: (result) => {
        if (!result) {
          return ['Tickets'];
        }

        return [
          ...result.tickets.map((ticket) => ({ type: 'Tickets' as const, id: ticket._id })),
          { type: 'Tickets' as const, id: 'LIST' }
        ];
      }
    }),
    createTicket: builder.mutation<Ticket, CreateTicketRequest>({
      query: (payload) => ({
        url: '/tickets',
        method: 'POST',
        body: payload
      }),
      invalidatesTags: [{ type: 'Tickets', id: 'LIST' }],
      async onQueryStarted(_payload, { queryFulfilled }) {
        try {
          await queryFulfilled;
          showSuccessToast('Ticket created successfully');
        } catch (error: unknown) {
          showErrorToast(getRtkQueryErrorMessage(error, 'Failed to create ticket.'));
        }
      }
    }),
    updateTicket: builder.mutation<Ticket, UpdateTicketPayload>({
      query: ({ id, data }) => ({
        url: `/tickets/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (_result, _error, { id, data }) => {
        // Skip full list re-fetch for status-only updates (Kanban drag) —
        // the optimistic patch already reflects the new state.
        const isStatusOnly =
          data.status !== undefined &&
          data.title === undefined &&
          data.description === undefined &&
          data.priority === undefined &&
          data.tags === undefined &&
          data.estimatedTime === undefined &&
          data.assignedTo === undefined;

        return [
          { type: 'Tickets', id },
          ...(isStatusOnly ? [] : [{ type: 'Tickets' as const, id: 'LIST' }]),
          { type: 'Activity', id }
        ];
      },
      async onQueryStarted(payload, { queryFulfilled }) {
        try {
          await queryFulfilled;
          const message = payload.data.status
            ? `Status updated to "${payload.data.status}"`
            : 'Ticket updated successfully';
          showSuccessToast(message);
        } catch (error: unknown) {
          showErrorToast(getRtkQueryErrorMessage(error, 'Failed to update ticket.'));
        }
      }
    }),
    analyzeTicket: builder.mutation<TicketAnalysisResult, AnalyzeTicketRequest>({
      query: (payload) => ({
        url: '/tickets/analyze',
        method: 'POST',
        body: payload
      })
    }),
    getTicketById: builder.query<Ticket, string>({
      query: (id) => `/tickets/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Tickets', id }]
    }),
    deleteTicket: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/tickets/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Tickets', id },
        { type: 'Tickets', id: 'LIST' }
      ],
      async onQueryStarted(_id, { queryFulfilled }) {
        try {
          await queryFulfilled;
          showSuccessToast('Ticket deleted successfully');
        } catch (error: unknown) {
          showErrorToast(getRtkQueryErrorMessage(error, 'Failed to delete ticket.'));
        }
      }
    })
  })
});

export const {
  useAnalyzeTicketMutation,
  useCreateTicketMutation,
  useDeleteTicketMutation,
  useGetTicketByIdQuery,
  useGetTicketsQuery,
  useUpdateTicketMutation
} = ticketsApi;

export { ticketsApi };
