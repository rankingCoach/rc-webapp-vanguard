import { useEffect, useState } from 'react';

export const useToggleContracted = (intervalMs = 1000) => {
  const [contracted, setContracted] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setContracted((prev) => !prev);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return contracted;
};
