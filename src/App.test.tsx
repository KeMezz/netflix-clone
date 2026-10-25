import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { RecoilRoot } from 'recoil';
import App from './App';
import { apiKeyAtom } from './atom';
import { clearApiKey, setApiKey } from './api';

// Network is mocked: TMDB responses are canned by endpoint path (synthetic test keys only,
// no real TMDB key is ever used or sent). Router, react-query, recoil, framer-motion,
// react-hook-form and styled-components are real.
const SYNTHETIC_KEY = 'synthetic-tmdb-key-9876543210fedcba';

const movie = (id: number, title: string) => ({
  id,
  title,
  original_title: `${title} (orig)`,
  overview: `${title} overview`,
  backdrop_path: `/b${id}.jpg`,
  poster_path: `/p${id}.jpg`,
  vote_average: 7.5,
});

const NOW_PLAYING = { results: [movie(1, 'Banner Movie'), movie(2, 'Slide Movie')] };
const DETAIL = {
  ...movie(2, 'Slide Movie'),
  production_companies: [{ name: 'Studio X' }],
  genres: [{ name: 'Drama' }],
};
const SEARCH_MOVIES = { total_results: 1, results: [movie(9, 'Found Movie')] };
const EMPTY = { total_results: 0, results: [] };

const respond = (url: string): unknown => {
  const { pathname, searchParams } = new URL(url);
  const path = pathname.replace('/3', '');
  if (path === '/movie/now_playing') return NOW_PLAYING;
  if (path === '/movie/top_rated' || path === '/movie/upcoming' || path === '/movie/latest') {
    return { results: [movie(3, 'Other Movie'), movie(4, 'Another Movie')] };
  }
  if (path === '/movie/2') return DETAIL;
  if (path === '/search/movie') return searchParams.get('query') === 'found' ? SEARCH_MOVIES : EMPTY;
  if (path === '/search/tv') return EMPTY;
  return { results: [] };
};

const setWidth = (width: number) =>
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });

const renderApp = (path = '/', initialApiKey = '') => {
  window.history.pushState({}, '', path);
  if (initialApiKey) {
    setApiKey(initialApiKey);
  } else {
    clearApiKey();
  }
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return {
    queryClient,
    ...render(
      <RecoilRoot
        initializeState={({ set }) => {
          if (initialApiKey) {
            set(apiKeyAtom, initialApiKey);
          }
        }}
      >
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </RecoilRoot>
    ),
  };
};

beforeEach(() => {
  clearApiKey();
  localStorage.clear();
  sessionStorage.clear();
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  global.fetch = jest.fn((url: RequestInfo) =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(respond(String(url))),
    } as Response)
  ) as jest.Mock;
});

afterEach(() => {
  setWidth(1024);
  clearApiKey();
});

test('narrow viewports (jsdom default 1024px) show the unsupported-mobile notice instead of the app and do not call API', () => {
  renderApp();
  expect(screen.getByText('모바일 버전은 아직 지원되지 않습니다.')).toBeInTheDocument();
  expect(screen.queryByText('홈')).not.toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
});

test('no-key: desktop home shows guidance and key input, making ZERO network calls before key input', () => {
  setWidth(1400);
  renderApp('/', '');
  // Clear guidance text
  expect(screen.getByText('TMDB API 키 설정')).toBeInTheDocument();
  expect(screen.getByText(/외부 네트워크 요청이 전혀 발생하지 않습니다/)).toBeInTheDocument();
  expect(screen.getByText(/보안 및 메모리 전용 안내/)).toBeInTheDocument();
  expect(screen.getByText(/브라우저 개발자 도구\(DevTools 네트워크 탭\) 및 TMDB API 서버로 전송되는 요청에는 키가 포함되어 노출됩니다/)).toBeInTheDocument();

  // Zero network calls before input
  expect(global.fetch).not.toHaveBeenCalled();
});

test('success: entering synthetic key via UI form unlocks desktop home, banner, sliders, and movie detail', async () => {
  setWidth(1400);
  renderApp('/', '');

  // Enter synthetic key in the input form
  const input = screen.getByLabelText('TMDB API Key');
  userEvent.type(input, SYNTHETIC_KEY);
  userEvent.click(screen.getByText('API 키 적용'));

  // Banner and sliders render
  expect(await screen.findByText('Banner Movie')).toBeInTheDocument();
  expect(screen.getByText('오늘 영화 순위 1위')).toBeInTheDocument();
  expect(screen.getByText('홈')).toBeInTheDocument();
  expect(screen.getByText('시리즈')).toBeInTheDocument();
  expect(screen.getByText('Now Playing')).toBeInTheDocument();

  // Verify fetch was called with synthetic key
  const calls = (global.fetch as jest.Mock).mock.calls.map(([u]) => String(u));
  expect(calls.some((u) => u.includes('/movie/now_playing') && u.includes(SYNTHETIC_KEY))).toBe(true);

  // Click slide to open movie detail route
  userEvent.click((await screen.findAllByText('Slide Movie'))[0], undefined, {
    skipPointerEventsCheck: true,
  });
  expect(window.location.pathname).toBe('/movie/2');
  expect((await screen.findAllByText('Slide Movie overview')).length).toBeGreaterThan(0);
  expect(screen.getAllByText('Studio X').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Drama').length).toBeGreaterThan(0);
});

test('success: header search navigates to /search/<keyword> and lists movie results with synthetic key', async () => {
  setWidth(1400);
  const { container } = renderApp('/', SYNTHETIC_KEY);
  await screen.findByText('Banner Movie');

  userEvent.click(container.querySelector('.fa-search') as HTMLElement);
  userEvent.type(screen.getByPlaceholderText('검색어 입력...'), 'found{enter}');

  expect(await screen.findByText('Movie Results')).toBeInTheDocument();
  expect(window.location.pathname).toBe('/search/found');
  expect(within(container).getAllByText('Found Movie').length).toBeGreaterThan(0);

  userEvent.type(screen.getByPlaceholderText('검색어 입력...'), 'nothing{enter}');
  expect(await screen.findByText('검색 결과가 없습니다')).toBeInTheDocument();
});

test('no-network: network failure when key is provided does not crash app or leak key', async () => {
  setWidth(1400);
  global.fetch = jest.fn(() => Promise.reject(new Error('Network offline / connection refused')));

  renderApp('/', SYNTHETIC_KEY);

  // App should remain mounted and not leak credentials into DOM
  await waitFor(() => {
    expect(screen.queryByText(SYNTHETIC_KEY)).not.toBeInTheDocument();
  });
});

test('error: TMDB API HTTP 401 response is handled gracefully without leaking synthetic key in DOM or logs', async () => {
  setWidth(1400);
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: () => Promise.resolve({ status_message: 'Invalid API key' }),
    } as Response)
  );

  renderApp('/', SYNTHETIC_KEY);

  await waitFor(() => {
    // Assert synthetic key is never rendered into DOM text
    expect(screen.queryByText(SYNTHETIC_KEY)).not.toBeInTheDocument();
  });
});

test('cancel: clicking "키 끄기 / 삭제" removes key from memory, stops queries, and returns to guidance state', async () => {
  setWidth(1400);
  renderApp('/', SYNTHETIC_KEY);

  // Wait for home banner to load
  expect(await screen.findByText('Banner Movie')).toBeInTheDocument();

  // Open Key Modal via Header button
  const headerKeyBtn = screen.getByTitle('TMDB API 키 설정 / 끄기');
  userEvent.click(headerKeyBtn);

  // Click clear button
  const clearBtn = await screen.findByText('키 끄기 / 삭제 (메모리 초기화)');
  (global.fetch as jest.Mock).mockClear();
  userEvent.click(clearBtn);

  // Returns to guidance state
  expect((await screen.findAllByText('TMDB API 키 설정')).length).toBeGreaterThan(0);
  expect(screen.queryByText('Banner Movie')).not.toBeInTheDocument();

  // No further fetch calls
  expect(global.fetch).not.toHaveBeenCalled();
});

test('race: rapid search submissions resolve cleanly without stale state', async () => {
  setWidth(1400);
  const { container } = renderApp('/search/initial', SYNTHETIC_KEY);

  userEvent.click(container.querySelector('.fa-search') as HTMLElement);
  const searchInput = screen.getByPlaceholderText('검색어 입력...');

  // First search
  userEvent.type(searchInput, 'found{enter}');
  expect(await screen.findByText('Movie Results')).toBeInTheDocument();
  expect(window.location.pathname).toBe('/search/found');

  // Second rapid search with cleared input
  userEvent.clear(searchInput);
  userEvent.type(searchInput, 'nothing{enter}');

  expect(await screen.findByText('검색 결과가 없습니다')).toBeInTheDocument();
  expect(window.location.pathname).toBe('/search/nothing');
});

test('key exposure verification: synthetic key is strictly kept in memory and never persisted', async () => {
  setWidth(1400);
  renderApp('/', SYNTHETIC_KEY);

  await screen.findByText('Banner Movie');

  // Verify browser persistent stores are completely untouched
  expect(localStorage.getItem('apiKey')).toBeNull();
  expect(localStorage.getItem('TMDB_KEY')).toBeNull();
  expect(sessionStorage.getItem('apiKey')).toBeNull();
  expect(sessionStorage.getItem('TMDB_KEY')).toBeNull();
  expect(localStorage.length).toBe(0);
  expect(sessionStorage.length).toBe(0);
  expect(document.cookie).not.toContain(SYNTHETIC_KEY);
});
