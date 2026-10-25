import React from 'react';
import { act, cleanup, render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { RecoilRoot, useRecoilValue } from 'recoil';
import App from './App';
import { apiSessionAtom } from './atom';
import { clearApiKey, getApiKey, setApiKey } from './api';

const KEY_A = 'synthetic-A/+?credential';
const KEY_B = 'synthetic-B/+?credential';
const movie = (id: number, title: string) => ({
  id, title, name: title, original_title: title, original_name: title,
  overview: `${title} overview`, backdrop_path: `/b${id}.jpg`, poster_path: `/p${id}.jpg`,
  vote_average: 7.5, production_companies: [{ name: 'Studio X' }], genres: [{ name: 'Drama' }],
});
const EMPTY = { total_results: 0, results: [] };
const response = (body: unknown, status = 200) => ({ ok: status === 200, status, json: async () => body } as Response);
const respond = (url: string) => {
  const u = new URL(url);
  if (u.pathname.endsWith('/search/movie')) return u.searchParams.get('query') === 'found' ? { total_results: 1, results: [movie(9, 'Found Movie')] } : EMPTY;
  if (u.pathname.endsWith('/search/tv')) return u.searchParams.get('query') === 'tvonly' ? { total_results: 1, results: [movie(7, 'TV Only')] } : EMPTY;
  if (/\/(movie|tv)\/2$/.test(u.pathname)) return movie(2, 'Slide Movie');
  if (u.pathname.endsWith('/tv/latest')) return movie(5, 'Latest Show');
  return { results: [movie(1, 'Banner Movie'), movie(2, 'Slide Movie')] };
};
const setWidth = (width: number) => Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
let session: { generation: number; enabled: boolean };
function SessionProbe() { session = useRecoilValue(apiSessionAtom); return null; }
const clients: QueryClient[] = [];
const renderApp = (path = '/', key = '') => {
  window.history.pushState({}, '', path);
  if (key) setApiKey(key); else clearApiKey();
  // Real production retry policy is in useTmdbQuery, never disabled by this harness.
  const queryClient = new QueryClient();
  clients.push(queryClient);
  return { queryClient, ...render(<RecoilRoot initializeState={({ set }) => set(apiSessionAtom, { generation: 1, enabled: Boolean(key) })}>
    <QueryClientProvider client={queryClient}><App /><SessionProbe /></QueryClientProvider>
  </RecoilRoot>) };
};
const applyKey = (key: string) => {
  userEvent.type(screen.getByLabelText('TMDB API Key'), key);
  userEvent.click(screen.getByText('API 키 적용'));
};
const openKey = () => userEvent.click(screen.getByTitle('TMDB API 키 설정 / 끄기'));
const tmdbCache = (client: QueryClient) => client.getQueryCache().findAll(['tmdb']);
const pause = (ms: number) => act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); });

// These promises settle after the action under test. AbortSignal listeners model
// the browser transport, rather than mocking the query or its cancellation code.
function delayedTransport() {
  const requests: { url: string; signal: AbortSignal; aborted: boolean; finish: (body: unknown) => void }[] = [];
  global.fetch = jest.fn((url: RequestInfo, options?: RequestInit) => new Promise<Response>((resolve, reject) => {
    const signal = options?.signal as AbortSignal;
    const request = { url: String(url), signal, aborted: false, finish: (body: unknown) => resolve(response(body)) };
    requests.push(request);
    signal?.addEventListener('abort', () => { request.aborted = true; reject(new DOMException('aborted', 'AbortError')); });
  })) as jest.Mock;
  return requests;
}
beforeEach(() => {
  setWidth(1400);
  clearApiKey(); localStorage.clear(); sessionStorage.clear();
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  global.fetch = jest.fn(async (url: RequestInfo) => response(respond(String(url)))) as jest.Mock;
});
afterEach(() => {
  cleanup(); clients.splice(0).forEach(client => client.clear());
  clearApiKey(); jest.restoreAllMocks();
});

test('desktop threshold remains strictly above 1200', async () => {
  setWidth(1200); renderApp();
  expect(screen.getByText('모바일 버전은 아직 지원되지 않습니다.')).toBeInTheDocument();
  await pause(30); expect(global.fetch).not.toHaveBeenCalled();
});
test.each(['/', '/tv', '/search/found', '/movie/2', '/tv/2'])('no key blocks TMDB transport on %s (API guard is a second layer)', async path => {
  renderApp(path);
  expect(screen.getByText(/API 키 입력 전에는 TMDB API 요청/)).toBeInTheDocument();
  expect(screen.getByText(/Google Fonts 및 Font Awesome CDN/)).toBeInTheDocument();
  await pause(40); expect(global.fetch).not.toHaveBeenCalled();
});
test('enter key, home banner/slider, and movie detail still work', async () => {
  const { queryClient } = renderApp(); applyKey(KEY_A);
  expect(await screen.findByText('Banner Movie')).toBeInTheDocument();
  expect(screen.getByText('오늘 영화 순위 1위')).toBeInTheDocument();
  expect(screen.getByText('API 키 입력됨 (미검증)')).toBeInTheDocument();
  expect(JSON.stringify(tmdbCache(queryClient).map(q => q.queryKey))).not.toContain(KEY_A);
  userEvent.click(screen.getAllByText('Slide Movie')[0], undefined, { skipPointerEventsCheck: true });
  expect(window.location.pathname).toBe('/movie/2');
  expect((await screen.findAllByText('Studio X')).length).toBeGreaterThan(0);
  expect(screen.getAllByText('Drama').length).toBeGreaterThan(0);
  openKey(); expect(screen.getByLabelText('TMDB API Key')).toHaveValue('');
});
test('TV banner/slider and TV detail still work', async () => {
  renderApp('/tv', KEY_A);
  expect(await screen.findByText('현재 인기 TV 시리즈 1위')).toBeInTheDocument();
  userEvent.click(screen.getAllByText('Slide Movie')[0], undefined, { skipPointerEventsCheck: true });
  expect(window.location.pathname).toBe('/tv/2');
  expect((await screen.findAllByText('Studio X')).length).toBeGreaterThan(0);
});
test('header search navigation and empty results', async () => {
  const { container } = renderApp('/', KEY_A); await screen.findByText('Banner Movie');
  userEvent.click(container.querySelector('.fa-search') as HTMLElement);
  userEvent.type(screen.getByPlaceholderText('검색어 입력...'), 'found{enter}');
  expect((await screen.findAllByText('Found Movie')).length).toBeGreaterThan(0);
  expect(window.location.pathname).toBe('/search/found');
  userEvent.type(screen.getByPlaceholderText('검색어 입력...'), 'nothing{enter}');
  expect(await screen.findByText('검색 결과가 없습니다')).toBeInTheDocument();
});
test('intentional behavior improvement: zero movies and positive TV results displays TV', async () => {
  renderApp('/search/tvonly', KEY_A);
  expect((await screen.findAllByText('TV Only')).length).toBeGreaterThan(0);
  expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();
  expect(screen.queryByText('Movie Results')).not.toBeInTheDocument();
});
test.each([['/', 401, 4], ['/tv', 403, 4], ['/search/found', 401, 2]] as const)('rejected key shows recovery UI on %s without automatic retry', async (path, status, count) => {
  global.fetch = jest.fn(async () => response({}, status));
  const { queryClient } = renderApp(path, KEY_A);
  expect(await screen.findByRole('alert')).toHaveTextContent('TMDB API 키가 거부되었습니다');
  await waitFor(() => expect(tmdbCache(queryClient).every(q => q.state.status === 'error')).toBe(true));
  await pause(600); expect(global.fetch).toHaveBeenCalledTimes(count);
  expect(screen.queryByText('다시 시도')).not.toBeInTheDocument();
  userEvent.click(screen.getByText('키 다시 입력')); expect(screen.getByLabelText('TMDB API Key')).toHaveValue('');
  global.fetch = jest.fn(async (url: RequestInfo) => response(respond(String(url)))) as jest.Mock;
  applyKey(KEY_B);
  expect((await screen.findAllByText(path.includes('search') ? 'Found Movie' : 'Banner Movie')).length).toBeGreaterThan(0);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
test('offline retries once per request, reports network error, and can be turned off', async () => {
  global.fetch = jest.fn(async () => { throw new Error(`failure ${KEY_A} ${encodeURIComponent(KEY_A)}`); });
  renderApp('/', KEY_A);
  expect(await screen.findByRole('alert')).toHaveTextContent('네트워크 연결을 확인해 주세요.');
  await pause(600); expect(global.fetch).toHaveBeenCalledTimes(8);
  expect(document.body.textContent).not.toContain(KEY_A);
  const logged = (console.error as jest.Mock).mock.calls.flat().map(value => String(value)).join(' ');
  expect(logged).not.toContain(KEY_A); expect(logged).not.toContain(encodeURIComponent(KEY_A));
  expect(localStorage.length).toBe(0); expect(sessionStorage.length).toBe(0); expect(document.cookie).not.toContain(KEY_A);
  userEvent.click(screen.getByText('키 끄기'));
  expect(screen.getByLabelText('TMDB API Key')).toHaveValue('');
  expect(getApiKey()).toBe(''); expect(session.enabled).toBe(false);
});
test.each([['/', '/movie/upcoming', 'Upcoming'], ['/tv', '/tv/airing_today', 'Airing Today'], ['/search/tvonly', '/search/movie', 'Movie Results']] as const)('partial error on %s keeps successful content visible', async (path, failurePath, label) => {
  global.fetch = jest.fn(async (url: RequestInfo) => String(url).includes(failurePath) ? response({}, 403) : response(respond(String(url)))) as jest.Mock;
  renderApp(path, KEY_A);
  expect(await screen.findByRole('alert')).toHaveTextContent(label);
  expect((await screen.findAllByText(path.includes('search') ? 'TV Only' : 'Banner Movie')).length).toBeGreaterThan(0);
});
test.each(['/movie/2', '/tv/2'])('detail errors have recovery UI while parent lists remain usable on %s', async path => {
  global.fetch = jest.fn(async (url: RequestInfo) => /\/(movie|tv)\/2\?/.test(String(url)) ? response({}, 401) : response(respond(String(url)))) as jest.Mock;
  renderApp(path, KEY_A);
  expect((await screen.findAllByRole('alert'))[0]).toHaveTextContent('detail');
  expect(screen.getByText('Banner Movie')).toBeInTheDocument();
});
test('key A to B cancels delayed A, removes old cache and does not display late A data', async () => {
  const requests = delayedTransport(); const { queryClient } = renderApp('/', KEY_A);
  await waitFor(() => expect(requests).toHaveLength(4));
  await act(async () => requests[0].finish(respond(requests[0].url)));
  expect(await screen.findByText('Banner Movie')).toBeInTheDocument();
  const oldGeneration = session.generation;
  queryClient.setQueryData(['tmdb', oldGeneration, 'inactive-cache'], { old: true });
  openKey(); expect(screen.getByLabelText('TMDB API Key')).toHaveValue(''); applyKey(KEY_B);
  await waitFor(() => expect(requests).toHaveLength(8));
  expect(requests.slice(1, 4).every(r => r.signal instanceof AbortSignal && r.signal.aborted && r.aborted)).toBe(true);
  expect(tmdbCache(queryClient).filter(q => q.queryKey[1] === oldGeneration)).toHaveLength(0);
  expect(getApiKey()).toBe(KEY_B);
  expect(requests.slice(4).every(r => new URL(r.url).searchParams.get('api_key') === KEY_B)).toBe(true);
  await act(async () => requests.forEach((r, i) => r.finish({ results: [movie(1, i < 4 ? 'Late A' : 'Current B'), movie(2, 'Slide B')] })));
  expect(await screen.findByText('Current B')).toBeInTheDocument();
  expect(screen.queryByText('Late A')).not.toBeInTheDocument();
  expect(localStorage.length).toBe(0); expect(sessionStorage.length).toBe(0);
});
test('clear during in-flight requests aborts transport, removes cached data and module key, and blocks late completion/retry', async () => {
  const requests = delayedTransport(); const { queryClient } = renderApp('/', KEY_A);
  await waitFor(() => expect(requests).toHaveLength(4));
  const oldGeneration = session.generation;
  queryClient.setQueryData(['tmdb', oldGeneration, 'inactive-cache'], { old: true });
  openKey(); userEvent.click(screen.getByText('키 끄기 / 삭제 (메모리 초기화)'));
  expect(requests.every(r => r.signal instanceof AbortSignal && r.signal.aborted && r.aborted)).toBe(true);
  expect(getApiKey()).toBe(''); expect(session.enabled).toBe(false);
  expect(tmdbCache(queryClient).filter(q => q.queryKey[1] === oldGeneration)).toHaveLength(0);
  await act(async () => requests.forEach(r => r.finish({ results: [movie(1, 'Late A')] })));
  await pause(650);
  expect(requests).toHaveLength(4); expect(screen.queryByText('Late A')).not.toBeInTheDocument();
  expect(screen.getByLabelText('TMDB API Key')).toHaveValue('');
  expect(tmdbCache(queryClient).every(q => q.state.data === undefined)).toBe(true);
});
test('pagehide (including persisted bfcache transition) clears state and aborts requests', async () => {
  const requests = delayedTransport(); const { queryClient } = renderApp('/', KEY_A);
  await waitFor(() => expect(requests).toHaveLength(4)); const oldGeneration = session.generation;
  act(() => { window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })); });
  expect(getApiKey()).toBe(''); expect(session.enabled).toBe(false);
  expect(requests.every(r => r.aborted)).toBe(true);
  expect(tmdbCache(queryClient).filter(q => q.queryKey[1] === oldGeneration)).toHaveLength(0);
  expect(screen.getByLabelText('TMDB API Key')).toHaveValue('');
});
test('app unmount clears module key, cache, and delayed transport', async () => {
  const requests = delayedTransport(); const { queryClient, unmount } = renderApp('/', KEY_A);
  await waitFor(() => expect(requests).toHaveLength(4)); unmount();
  expect(getApiKey()).toBe(''); expect(tmdbCache(queryClient)).toHaveLength(0);
  expect(requests.every(r => r.aborted)).toBe(true);
});
test('changing search before delayed response aborts old requests and displays only latest results', async () => {
  const requests = delayedTransport(); const { container } = renderApp('/search/old', KEY_A);
  await waitFor(() => expect(requests).toHaveLength(2));
  userEvent.click(container.querySelector('.fa-search') as HTMLElement);
  userEvent.type(screen.getByPlaceholderText('검색어 입력...'), 'found{enter}');
  await waitFor(() => expect(requests).toHaveLength(4));
  expect(requests.slice(0, 2).every(r => r.aborted)).toBe(true);
  await act(async () => requests.forEach((r, i) => r.finish(i < 2 ? { total_results: 1, results: [movie(3, 'Stale Search')] } : respond(r.url))));
  expect((await screen.findAllByText('Found Movie')).length).toBeGreaterThan(0);
  expect(within(container).queryByText('Stale Search')).not.toBeInTheDocument();
});

test('turning key off cancels a scheduled network retry', async () => {
  global.fetch = jest.fn(async () => { throw new TypeError('offline'); });
  const { queryClient } = renderApp('/', KEY_A);
  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(4));
  const oldGeneration = session.generation;
  openKey(); userEvent.click(screen.getByText('키 끄기 / 삭제 (메모리 초기화)'));
  await pause(650);
  expect(global.fetch).toHaveBeenCalledTimes(4);
  expect(getApiKey()).toBe('');
  expect(tmdbCache(queryClient).filter(q => q.queryKey[1] === oldGeneration)).toHaveLength(0);
});

test('network error offers an explicit retry that can recover', async () => {
  global.fetch = jest.fn(async () => { throw new TypeError('offline'); });
  renderApp('/', KEY_A);
  expect(await screen.findByRole('alert')).toHaveTextContent('네트워크');
  global.fetch = jest.fn(async (url: RequestInfo) => response(respond(String(url)))) as jest.Mock;
  userEvent.click(screen.getByText('다시 시도'));
  expect(await screen.findByText('Banner Movie')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
