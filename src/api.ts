export const API_KEY = "aa9053913fbf30c4ec2f4307ecba00f7";
export const BASE_URL = "https://api.themoviedb.org/3";

export const fetchNowPlayingMovie = () => {
  return fetch(
    `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=ko&page=1`
  ).then((response) => response.json());
};

export const fetchPopularMovie = () => {
  return fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=ko&page=1`
  ).then((response) => response.json());
};

export const fetchTopRatedMovie = () => {
  return fetch(
    `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=ko&page=1`
  ).then((response) => response.json());
};

export const fetchUpcomingMovie = () => {
  return fetch(
    `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=ko&page=1`
  ).then((response) => response.json());
};

export const fetchMovieDetail = (movieId?: number) => {
  return fetch(
    `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=ko`
  ).then((response) => response.json());
};

export const fetchPopularTvshows = () => {
  return fetch(
    `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=ko&page=1`
  ).then((response) => response.json());
};

export const fetchTvDetail = (tvId?: number) => {
  return fetch(`${BASE_URL}/tv/${tvId}?api_key=${API_KEY}&language=ko`).then(
    (response) => response.json()
  );
};

export const fetchSearchResults = (keywords?: string) => {
  return fetch(
    `${BASE_URL}/search/multi?api_key=${API_KEY}&language=ko&query=${keywords}&page=1&include_adult=%08true`
  ).then((response) => response.json());
};