import { useEffect, useState } from "react";

/** O valor só muda depois de `delay` ms sem alterações (ex.: busca que vai ao backend a cada tecla) */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}
