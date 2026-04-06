import { useEffect, useState } from 'react';

const useInitialLoadSkeleton = (isLoading: boolean, hasResolved: boolean): boolean => {
  const [hasResolvedOnce, setHasResolvedOnce] = useState(false);

  useEffect(() => {
    if (hasResolved) {
      setHasResolvedOnce(true);
    }
  }, [hasResolved]);

  return isLoading && !hasResolvedOnce;
};

export { useInitialLoadSkeleton };
