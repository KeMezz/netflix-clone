import { useCallback, useEffect } from "react";
import { QueryClient, useQuery, useQueryClient } from "react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { apiSessionAtom } from "./atom";
import { clearApiKey, setApiKey, TmdbError } from "./api";

const tmdbQueries = { queryKey: ["tmdb"] };

export function resetTmdb(client: QueryClient) {
  // cancelQueries synchronously aborts consumed fetch signals before cache removal.
  void client.cancelQueries(tmdbQueries);
  client.removeQueries(tmdbQueries);
  clearApiKey();
}

export function useApiSession() {
  const [session, setSession] = useRecoilState(apiSessionAtom);
  const client = useQueryClient();
  const replaceKey = useCallback((key: string) => {
    resetTmdb(client);
    const trimmed = key.trim();
    if (trimmed) setApiKey(trimmed);
    setSession(previous => ({ generation: previous.generation + 1, enabled: Boolean(trimmed) }));
  }, [client, setSession]);
  return { ...session, replaceKey };
}

export function ApiSessionLifecycle() {
  const { replaceKey } = useApiSession();
  useEffect(() => {
    // pagehide also runs when the page enters bfcache; restored pages need re-entry.
    const clear = () => replaceKey("");
    window.addEventListener("pagehide", clear);
    return () => {
      window.removeEventListener("pagehide", clear);
      clear();
    };
  }, [replaceKey]);
  return null;
}

export function useTmdbQuery<T>(
  key: readonly unknown[],
  fetcher: (signal?: AbortSignal) => Promise<T>,
  enabled = true
) {
  const session = useRecoilValue(apiSessionAtom);
  return useQuery<T, TmdbError>(
    ["tmdb", session.generation, ...key],
    ({ signal }) => fetcher(signal),
    {
      enabled: session.enabled && enabled,
      retry: (count, error) => count < 1 && (!error.status || error.status >= 500),
      retryDelay: 500,
      // User-triggered retry is explicit; focus/reconnect must not re-send a rejected key.
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );
}
