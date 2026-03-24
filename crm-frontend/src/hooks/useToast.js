// src/hooks/useToast.js
import { useState, useCallback } from 'react';

let toastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'success', duration = 3000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const success = useCallback((msg) => show(msg, 'success'), [show]);
  const error   = useCallback((msg) => show(msg, 'error', 4000), [show]);
  const info    = useCallback((msg) => show(msg, 'info'), [show]);

  return { toasts, show, success, error, info };
};
