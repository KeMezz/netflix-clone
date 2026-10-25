import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { RecoilRoot } from 'recoil';
import App from './App';

// Network is mocked: TMDB responses are canned by endpoint path (no key is used
// or sent anywhere). Router, react-query, recoil, framer-motion, react-hook-form
// and styled-components are real.
const movie = (id: number, title: string) => ({
  id, title, original_title: `${title} (orig)`, overview: `${title} overview`, backdrop_path: `/b${id}.jpg`, poster_path: `/p${id}.jpg`, vote_average: 7.5,
});
const NOW_PLAYING = { results: [movie(1, 'Banner Movie'), movie(2, 'Slide Movie')] };
const DETAIL = { ...movie(2, 'Slide Movie'), production_companies: [{ name: 'Studio X' }], genres: [{ name: 'Drama' }] };
const SEARCH_MOVIES = { total_results: 1, results: [movie(9, 'Found Movie')] };
const EMPTY = { total_results: 0, results: [] };

const respond = (url: string): unknown => {
  const { pathname, searchParams } = new URL(url);
  const path = pathname.replace('/3', '');
  if (path === '/movie/now_playing') return NOW_PLAYING;
  if (path === '/movie/top_rated' || path === '/movie/upcoming' || path === '/movie/latest') return { results: [movie(3, 'Other Movie'), movie(4, 'Another Movie')] };
  if (path === '/movie/2') return DETAIL;
  if (path === '/search/movie') return searchParams.get('query') === 'found' ? SEARCH_MOVIES : EMPTY;
  if (path === '/search/tv') return EMPTY;
  return { results: [] };
};

const setWidth = (width: number) => Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
const renderApp = (path = '/') => {
  window.history.pushState({}, '', path);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </RecoilRoot>
  );
};

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  global.fetch = jest.fn((url: RequestInfo) => Promise.resolve({ ok: true, json: () => Promise.resolve(respond(String(url))) } as Response)) as jest.Mock;
});
afterEach(() => setWidth(1024));

test('narrow viewports (jsdom default 1024px) show the unsupported-mobile notice instead of the app', () => {
  renderApp();
  expect(screen.getByText('모바일 버전은 아직 지원되지 않습니다.')).toBeInTheDocument();
  expect(screen.queryByText('홈')).not.toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
});

test('desktop home renders header, banner and sliders from TMDB data and opens a movie detail route', async () => {
  setWidth(1400);
  renderApp();
  expect(await screen.findByText('Banner Movie')).toBeInTheDocument();
  expect(screen.getByText('오늘 영화 순위 1위')).toBeInTheDocument();
  expect(screen.getByText('홈')).toBeInTheDocument();
  expect(screen.getByText('시리즈')).toBeInTheDocument();
  expect(screen.getByText('Now Playing')).toBeInTheDocument();
  const calls = (global.fetch as jest.Mock).mock.calls.map(([u]) => new URL(String(u)).pathname);
  expect(calls).toEqual(expect.arrayContaining(['/3/movie/now_playing', '/3/movie/top_rated', '/3/movie/upcoming']));
  // the hover info box is pointer-events:none until hovered; the click still bubbles to the slide's onClick
  userEvent.click((await screen.findAllByText('Slide Movie'))[0], undefined, { skipPointerEventsCheck: true });
  expect(window.location.pathname).toBe('/movie/2');
  // every slider on the page mounts its own detail panel for /movie/:id, so expect >= 1 of each
  expect((await screen.findAllByText('Slide Movie overview')).length).toBeGreaterThan(0);
  expect(screen.getAllByText('Studio X').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Drama').length).toBeGreaterThan(0);
  expect((global.fetch as jest.Mock).mock.calls.map(([u]) => new URL(String(u)).pathname)).toContain('/3/movie/2');
});

test('header search navigates to /search/<keyword> and lists movie results, and shows the empty state otherwise', async () => {
  setWidth(1400);
  const { container } = renderApp();
  await screen.findByText('Banner Movie');
  userEvent.click(container.querySelector('.fa-search') as HTMLElement);
  userEvent.type(screen.getByPlaceholderText('검색어 입력...'), 'found{enter}');
  expect(await screen.findByText('Movie Results')).toBeInTheDocument();
  expect(window.location.pathname).toBe('/search/found');
  expect(within(container).getAllByText('Found Movie').length).toBeGreaterThan(0);
  userEvent.type(screen.getByPlaceholderText('검색어 입력...'), 'nothing{enter}');
  expect(await screen.findByText('검색 결과가 없습니다')).toBeInTheDocument();
});
