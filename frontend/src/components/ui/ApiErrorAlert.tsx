import type { ApiError } from '../../types/api';
import { getApiErrorMessage } from '../../types/api';

interface ApiErrorAlertProps {
  error: ApiError;
  fallbackMessage: string;
}

const ApiErrorAlert = ({ error, fallbackMessage }: ApiErrorAlertProps) => {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-red-800 shadow-sm">
      <div className="flex items-start gap-2.5">
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="mt-0.5 h-5 w-5 flex-none text-red-500"
        >
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        <div>
          <p className="text-sm font-semibold">Something went wrong</p>
          <p className="mt-0.5 text-sm text-red-700">{getApiErrorMessage(error, fallbackMessage)}</p>
        </div>
      </div>
    </div>
  );
};

export { ApiErrorAlert };
