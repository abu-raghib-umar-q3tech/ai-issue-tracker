import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError
} from '@reduxjs/toolkit/query/react';
import { clearStoredSession, getStoredToken } from '../features/auth/authStorage';

const resolveApiBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_URL;

  if (url && typeof url === 'string' && url.trim().length > 0) {
    return url.trim();
  }

  if (import.meta.env.PROD) {
    throw new Error('VITE_API_URL is not set. This variable is required for production builds.');
  }

  return 'http://localhost:5001/api';
};

const API_BASE_URL = resolveApiBaseUrl();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = getStoredToken();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }
});

const baseQueryWithAuthHandling: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    clearStoredSession();
    api.dispatch(baseApi.util.resetApiState());
  }

  return result;
};

const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuthHandling,
  tagTypes: ['Tickets'],
  endpoints: () => ({})
});

export { baseApi };
