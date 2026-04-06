import { useEffect, useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import { baseApi } from '../../services/baseApi';

const GLOBAL_LOADER_DELAY_MS = 180;

const GlobalApiLoader = () => {
  const hasBackgroundQuery = useAppSelector((state) => {
    const apiState = state[baseApi.reducerPath];

    return Object.values(apiState.queries).some(
      (query) => query?.status === 'pending' && typeof query.fulfilledTimeStamp === 'number'
    );
  });
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!hasBackgroundQuery) {
      setIsVisible(false);
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setIsVisible(true);
    }, GLOBAL_LOADER_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasBackgroundQuery]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[90]" role="status" aria-label="Refreshing data">
      <div className="app-container">
        <div className="global-loader-track">
          <span className="global-loader-bar" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};

export { GlobalApiLoader };
