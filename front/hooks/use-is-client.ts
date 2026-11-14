import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Retorna false na renderização do servidor e durante a hidratação, e true depois que o
 * componente já está montado no navegador. Útil para remontar componentes cujo HTML depende
 * do aparelho (ex.: atributos do react-aria que variam entre Android, iOS e desktop).
 */
export const useIsClient = () =>
    useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    );
