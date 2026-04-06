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
        <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-red-100 text-red-700" aria-hidden="true">
          !
        </span>
        <div>
          <p className="text-sm font-semibold">Something went wrong</p>
          <p className="mt-0.5 text-sm text-red-700">{getApiErrorMessage(error, fallbackMessage)}</p>
        </div>
      </div>
    </div>
  );
};

export { ApiErrorAlert };
