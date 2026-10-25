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

export const resolveKey = (explicitKey?: string): string => {
  const key = (explicitKey || inMemoryApiKey || "").trim();
  if (!key) {
    throw new Error("TMDB API key is missing. Please provide an API key in memory.");
  }
  return key;
};

export const safeFetchJson = async <T = any>(
  urlBuilder: (encodedKey: string) => string,
  explicitKey?: string
): Promise<T> => {
  const key = resolveKey(explicitKey);
  const url = urlBuilder(encodeURIComponent(key));
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API request failed with HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    const message = error?.message ? String(error.message) : "Network request failed";
    const sanitized = key ? message.split(key).join("[REDACTED_KEY]") : message;
    throw new Error(sanitized);
  }
};

export const fetchNowPlayingMovie = (apiKey?: string) => {
  return safeFetchJson(
    (key) => `${BASE_URL}/movie/now_playing?api_key=${key}&language=ko&page=1`,
    apiKey
  );
};

export const fetchLatestMovie = (apiKey?: string) => {
  return safeFetchJson(
    (key) => `${BASE_URL}/movie/latest?api_key=${key}&language=ko&page=1`,
    apiKey
  );
};

export const fetchTopRatedMovie = (apiKey?: string) => {
  return safeFetchJson(
    (key) => `${BASE_URL}/movie/top_rated?api_key=${key}&language=ko&page=1`,
    apiKey
  );
};

export const fetchUpcomingMovie = (apiKey?: string) => {
  return safeFetchJson(
    (key) => `${BASE_URL}/movie/upcoming?api_key=${key}&language=ko&page=1`,
    apiKey
  );
};

export const fetchMovieDetail = (movieId?: number, apiKey?: string) => {
  return safeFetchJson(
    (key) => `${BASE_URL}/movie/${movieId}?api_key=${key}&language=ko`,
    apiKey
  );
};

export const fetchPopularTvshows = (apiKey?: string) => {
  return safeFetchJson(
    (key) => `${BASE_URL}/tv/popular?api_key=${key}&language=ko&page=1`,
    apiKey
  );
};

export const fetchLatestTvShows = (apiKey?: string) => {
  return safeFetchJson(
    (key) => `${BASE_URL}/tv/latest?api_key=${key}&language=ko`,
    apiKey
  );
};

export const fetchAiringToday = (apiKey?: string) => {
  return safeFetchJson(
    (key) => `${BASE_URL}/tv/airing_today?api_key=${key}&language=ko&page=1`,
    apiKey
  );
};

export const fetchTopRatedShows = (apiKey?: string) => {
  return safeFetchJson(
    (key) => `${BASE_URL}/tv/top_rated?api_key=${key}&language=ko&page=1`,
    apiKey
  );
};

export const fetchTvDetail = (tvId?: number, apiKey?: string) => {
  return safeFetchJson(
    (key) => `${BASE_URL}/tv/${tvId}?api_key=${key}&language=ko`,
    apiKey
  );
};

export const fetchSearchMovie = (keywords?: string, apiKey?: string) => {
  return safeFetchJson(
    (key) =>
      `${BASE_URL}/search/movie?api_key=${key}&language=ko&query=${encodeURIComponent(
        keywords || ""
      )}&page=1&include_adult=false`,
    apiKey
  );
};

export const fetchSearchTv = (keywords?: string, apiKey?: string) => {
  return safeFetchJson(
    (key) =>
      `${BASE_URL}/search/tv?api_key=${key}&language=ko&query=${encodeURIComponent(
        keywords || ""
      )}&page=1&include_adult=false`,
    apiKey
  );
};
