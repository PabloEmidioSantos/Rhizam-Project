import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../lib/errors.js";

export function useAsyncData(loader) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(false);
  const latestRequest = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      latestRequest.current += 1;
    };
  }, []);

  const reload = useCallback(async () => {
    if (!mounted.current) return;
    const requestId = ++latestRequest.current;
    setLoading(true);
    setError(null);

    try {
      const result = await loader();
      if (mounted.current && requestId === latestRequest.current) setData(result);
    } catch (loadError) {
      if (mounted.current && requestId === latestRequest.current) {
        setError(getErrorMessage(loadError));
      }
    } finally {
      if (mounted.current && requestId === latestRequest.current) setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    void reload();
    return () => {
      latestRequest.current += 1;
    };
  }, [reload]);

  return { data, loading, error, reload };
}
