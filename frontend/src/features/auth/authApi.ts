import { showErrorToast, showSuccessToast } from '../../components/ui/toast';
import { getRtkQueryErrorMessage } from '../../types/api';
import { baseApi } from '../../services/baseApi';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from './types';

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (payload) => ({
        url: '/auth/login',
        method: 'POST',
        body: payload
      }),
      async onQueryStarted(_payload, { queryFulfilled }) {
        try {
          await queryFulfilled;
          showSuccessToast('Login successful');
        } catch (error: unknown) {
          showErrorToast(getRtkQueryErrorMessage(error, 'Login failed.'));
        }
      }
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (payload) => ({
        url: '/auth/register',
        method: 'POST',
        body: payload
      }),
      async onQueryStarted(_payload, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error: unknown) {
          showErrorToast(getRtkQueryErrorMessage(error, 'Signup failed.'));
        }
      }
    })
  })
});

export const { useLoginMutation, useRegisterMutation } = authApi;
export { authApi };
