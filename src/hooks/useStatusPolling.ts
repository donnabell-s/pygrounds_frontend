import { useState, useEffect, useCallback, useRef } from 'react';

export interface StatusPollingOptions {
  pollInterval?: number;
  stopPollingOnComplete?: boolean;
  onStatusChange?: (newStatus: any, oldStatus: any) => void;
  autoStart?: boolean;
  completedStatuses?: string[];
  failedStatuses?: string[];
}

export interface StatusPollingResult<T> {
  data: T | null;
  isPolling: boolean;
  pollCount: number;
  isLoading: boolean;
  error: string | null;
  startPolling: () => void;
  stopPolling: () => void;
  refreshStatus: () => void;
  isProcessing: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  hasError: boolean;
}

export const useStatusPolling = <T extends Record<string, any>>(
  fetchFunction: () => Promise<T>,
  statusKey: keyof T,
  options: StatusPollingOptions = {}
): StatusPollingResult<T> => {
  const {
    pollInterval = 2000,
    stopPollingOnComplete = true,
    onStatusChange = null,
    autoStart = true,
    completedStatuses = ['completed', 'success'],
    failedStatuses = ['failed', 'error']
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<number | null>(null);
  const previousStatusRef = useRef<any>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await fetchFunction();
      const currentStatus = result[statusKey];
      const previousStatus = previousStatusRef.current;
      
      setData(result);
      setPollCount(prev => prev + 1);
      
      // Call onChange if status actually changed
      if (previousStatus !== currentStatus && onStatusChange) {
        onStatusChange(result, { ...data, [statusKey]: previousStatus });
      }
      
      previousStatusRef.current = currentStatus;
      
      // Stop polling if completed/failed and stopPollingOnComplete is true
      if (stopPollingOnComplete && 
          ([...completedStatuses, ...failedStatuses].includes(currentStatus))) {
        setIsPolling(false);
      }
      
    } catch (err: any) {
      console.error('Error fetching status:', err);
      setError(err.message || 'Failed to fetch status');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction, statusKey, onStatusChange, stopPollingOnComplete, completedStatuses, failedStatuses, data]);

  const startPolling = useCallback(() => {
    setIsPolling(true);
    setPollCount(0);
    setError(null);
  }, []);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refreshStatus = useCallback(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Auto-start polling on mount if enabled
  useEffect(() => {
    if (autoStart) {
      startPolling();
    }
  }, [autoStart, startPolling]);

  // Polling effect
  useEffect(() => {
    if (isPolling) {
      // Initial fetch
      fetchStatus();
      
      // Set up interval
      intervalRef.current = window.setInterval(fetchStatus, pollInterval);
    } else {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPolling, fetchStatus, pollInterval]);

  const currentStatus = data ? data[statusKey] : null;
  
  return {
    data,
    isPolling,
    pollCount,
    isLoading,
    error,
    startPolling,
    stopPolling,
    refreshStatus,
    isProcessing: Boolean(currentStatus && !completedStatuses.includes(currentStatus) && !failedStatuses.includes(currentStatus)),
    isCompleted: Boolean(currentStatus && completedStatuses.includes(currentStatus)),
    isFailed: Boolean(currentStatus && failedStatuses.includes(currentStatus)),
    hasError: !!error
  };
};