import { API_KEY, clearApiKey, getApiKey, setApiKey, fetchNowPlayingMovie, fetchSearchMovie } from './api';
const KEY = 'synthetic-credential/+?';
beforeEach(() => { clearApiKey(); global.fetch = jest.fn(); });
afterEach(() => clearApiKey());
test('no bundled default key, and module clear removes its accessible value', () => {
  expect(API_KEY).toBe(''); setApiKey(KEY); expect(getApiKey()).toBe(KEY); clearApiKey(); expect(getApiKey()).toBe('');
});
test('API guard rejects missing key before transport even without query enabled', async () => {
  await expect(fetchNowPlayingMovie()).rejects.toThrow(); await expect(fetchSearchMovie('test')).rejects.toThrow();
  expect(global.fetch).not.toHaveBeenCalled();
});
test('URL encoding and real AbortSignal reach the transport', async () => {
  setApiKey(KEY); const controller = new AbortController();
  (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ results: [] }) });
  await fetchSearchMovie('한글 &/?', controller.signal);
  const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
  expect(new URL(url).searchParams.get('api_key')).toBe(KEY);
  expect(new URL(url).searchParams.get('query')).toBe('한글 &/?'); expect(options.signal).toBe(controller.signal);
});
test.each([401, 403, 500])('HTTP %s propagates only safe status, ignoring provider text containing a key', async status => {
  setApiKey(KEY); (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status, statusText: KEY });
  await expect(fetchNowPlayingMovie()).rejects.toMatchObject({ status, message: `TMDB API request failed with HTTP ${status}` });
});
test('network rejection never propagates raw/encoded credential or arbitrary transport messages', async () => {
  setApiKey(KEY); (global.fetch as jest.Mock).mockRejectedValue(new Error(`URL ${KEY} ${encodeURIComponent(KEY)}`));
  await expect(fetchNowPlayingMovie()).rejects.toMatchObject({ message: 'TMDB network request failed' });
});
