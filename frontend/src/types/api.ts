import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export interface ApiErrorResponse {
  message: string;
}

export type ApiError = FetchBaseQueryError | SerializedError | undefined;

interface QueryRejectedValue {
  error?: ApiError;
}

const hasMessage = (value: unknown): value is ApiErrorResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'message' in value && typeof (value as { message?: unknown }).message === 'string';
};

const isQueryRejectedValue = (value: unknown): value is QueryRejectedValue => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'error' in value;
};

export const getApiErrorMessage = (error: ApiError, fallback: string): string => {
  if (!error) {
    return fallback;
  }

  if ('data' in error && hasMessage(error.data)) {
    return error.data.message;
  }

  if ('message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return fallback;
};

export const getRtkQueryErrorMessage = (error: unknown, fallback: string): string => {
  if (!isQueryRejectedValue(error)) {
    return fallback;
  }

  return getApiErrorMessage(error.error, fallback);
};
