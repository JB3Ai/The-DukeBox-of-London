import { useState, useCallback } from 'react';

const API = process.env.REACT_APP_BACKEND_URL;

export function useApi() {
  const [loading, setLoading] = useState(false);

  const request = useCallback(async (path, options = {}) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}${path}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((path) => request(path), [request]);
  
  const post = useCallback((path, body) => request(path, {
    method: 'POST',
    body: JSON.stringify(body),
  }), [request]);

  return { get, post, loading };
}
