import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [state, setState] = useState({ visible: false, label: '' });
  const hideTimerRef = useRef(null);
  const minHideAtRef = useRef(0);

  const clearTimers = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const showLoader = useCallback((label = '') => {
    clearTimers();
    setState({ visible: true, label });
  }, []);

  const hideLoader = useCallback(() => {
    clearTimers();
    setState({ visible: false, label: '' });
  }, []);

  // Show loader for a guaranteed minimum duration (e.g., compulsory 2s after login).
  const showLoaderFor = useCallback((durationMs, label = '') => {
    return new Promise((resolve) => {
      clearTimers();
      setState({ visible: true, label });
      minHideAtRef.current = Date.now() + durationMs;
      hideTimerRef.current = setTimeout(() => {
        setState({ visible: false, label: '' });
        hideTimerRef.current = null;
        resolve();
      }, durationMs);
    });
  }, []);

  // Run an async task and only show the loader if it takes longer than `delay` ms.
  // If shown, keep it visible for at least `minDuration` ms to avoid flicker.
  const withLoader = useCallback(async (task, { label = '', delay = 250, minDuration = 500 } = {}) => {
    let shown = false;
    let shownAt = 0;
    const showTimer = setTimeout(() => {
      shown = true;
      shownAt = Date.now();
      setState({ visible: true, label });
    }, delay);

    try {
      return await task();
    } finally {
      clearTimeout(showTimer);
      if (shown) {
        const elapsed = Date.now() - shownAt;
        const remaining = Math.max(0, minDuration - elapsed);
        if (remaining === 0) {
          setState({ visible: false, label: '' });
        } else {
          hideTimerRef.current = setTimeout(() => {
            setState({ visible: false, label: '' });
            hideTimerRef.current = null;
          }, remaining);
        }
      }
    }
  }, []);

  return (
    <LoadingContext.Provider value={{ ...state, showLoader, hideLoader, showLoaderFor, withLoader }}>
      {children}
    </LoadingContext.Provider>
  );
};
