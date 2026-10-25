export const API_KEY = ""; // Kept as empty string for backward compatibility without leaking credentials
export const BASE_URL = "https://api.themoviedb.org/3";

let inMemoryApiKey: string = "";

export const setApiKey = (key: string) => {
  inMemoryApiKey = (key || "").trim();
};

export const getApiKey = () => inMemoryApiKey;

export const clearApiKey = () => {
  inMemoryApiKey = "";
};

export const hasApiKey = () => Boolean(inMemoryApiKey);

export class TmdbError extends Error {
  constructor(public status?: number) {
    super(status ? `TMDB API request failed with HTTP ${status}` : "TMDB network request failed");
    this.name = "TmdbError";
  }
}

export const resolveKey = (): string => {
  if (!inMemoryApiKey) throw new TmdbError(0);
  return inMemoryApiKey;
};

export const safeFetchJson = async <T = any>(
  urlBuilder: (encodedKey: string) => string,
  signal?: AbortSignal
): Promise<T> => {
  const key = resolveKey();
  try {
    const response = await fetch(urlBuilder(encodeURIComponent(key)), { signal });
    if (!response.ok) throw new TmdbError(response.status);
    return await response.json();
  } catch (error) {
    if (signal?.aborted) {
      const aborted = new Error("TMDB request cancelled");
      aborted.name = "AbortError";
      throw aborted;
    }
    // Never propagate transport/provider messages: they may contain the URL/key.
    throw error instanceof TmdbError ? error : new TmdbError();
  }
};

export const fetchNowPlayingMovie = (signal?: AbortSignal) => {
  return safeFetchJson(
    (key) => `${BASE_URL}/movie/now_playing?api_key=${key}&language=ko&page=1`,
    signal
  );
};

export const fetchLatestMovie = (signal?: AbortSignal) => {
  return safeFetchJson(
    (key) => `${BASE_URL}/movie/latest?api_key=${key}&language=ko&page=1`,
    signal
  );
};

export const fetchTopRatedMovie = (signal?: AbortSignal) => {
  return safeFetchJson(
    (key) => `${BASE_URL}/movie/top_rated?api_key=${key}&language=ko&page=1`,
    signal
  );
};

export const fetchUpcomingMovie = (signal?: AbortSignal) => {
  return safeFetchJson(
    (key) => `${BASE_URL}/movie/upcoming?api_key=${key}&language=ko&page=1`,
    signal
  );
};

export const fetchMovieDetail = (movieId?: number, signal?: AbortSignal) => {
  return safeFetchJson(
    (key) => `${BASE_URL}/movie/${movieId}?api_key=${key}&language=ko`,
    signal
  );
};

export const fetchPopularTvshows = (signal?: AbortSignal) => {
  return safeFetchJson(
    (key) => `${BASE_URL}/tv/popular?api_key=${key}&language=ko&page=1`,
    signal
  );
};

export const fetchLatestTvShows = (signal?: AbortSignal) => {
  return safeFetchJson(
    (key) => `${BASE_URL}/tv/latest?api_key=${key}&language=ko`,
    signal
  );
};

export const fetchAiringToday = (signal?: AbortSignal) => {
  return safeFetchJson(
    (key) => `${BASE_URL}/tv/airing_today?api_key=${key}&language=ko&page=1`,
    signal
  );
};

export const fetchTopRatedShows = (signal?: AbortSignal) => {
  return safeFetchJson(
    (key) => `${BASE_URL}/tv/top_rated?api_key=${key}&language=ko&page=1`,
    signal
  );
};

export const fetchTvDetail = (tvId?: number, signal?: AbortSignal) => {
  return safeFetchJson(
    (key) => `${BASE_URL}/tv/${tvId}?api_key=${key}&language=ko`,
    signal
  );
};

export const fetchSearchMovie = (keywords?: string, signal?: AbortSignal) => {
  return safeFetchJson(
    (key) =>
      `${BASE_URL}/search/movie?api_key=${key}&language=ko&query=${encodeURIComponent(
        keywords || ""
      )}&page=1&include_adult=false`,
    signal
  );
};

export const fetchSearchTv = (keywords?: string, signal?: AbortSignal) => {
  return safeFetchJson(
    (key) =>
      `${BASE_URL}/search/tv?api_key=${key}&language=ko&query=${encodeURIComponent(
        keywords || ""
      )}&page=1&include_adult=false`,
    signal
  );
};
