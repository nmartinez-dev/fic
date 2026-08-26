import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Datos financieros: toleramos 30s de "frescura" antes de revalidar.
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        // Permite hidratar también queries que quedaron en estado "pending"
        // durante el prefetch en el servidor (streaming SSR).
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * En el server siempre crea un cliente nuevo (uno por request).
 * En el browser reutiliza un singleton para no perder la caché entre renders.
 */
export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
