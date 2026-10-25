import {
  setApiKey,
  getApiKey,
  clearApiKey,
  hasApiKey,
  resolveKey,
  safeFetchJson,
  fetchNowPlayingMovie,
  fetchSearchMovie,
  API_KEY,
} from "./api";

describe("api module security and in-memory credential guarantees", () => {
  const SYNTHETIC_KEY = "synthetic-test-key-1234567890abcdef";

  beforeEach(() => {
    clearApiKey();
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    clearApiKey();
  });

  test("API_KEY export is empty string (no hardcoded credentials)", () => {
    expect(API_KEY).toBe("");
  });

  test("in-memory getter, setter, hasApiKey, and clearApiKey work purely in memory", () => {
    expect(hasApiKey()).toBe(false);
    expect(getApiKey()).toBe("");

    setApiKey(SYNTHETIC_KEY);
    expect(hasApiKey()).toBe(true);
    expect(getApiKey()).toBe(SYNTHETIC_KEY);

    clearApiKey();
    expect(hasApiKey()).toBe(false);
    expect(getApiKey()).toBe("");

    // Verify no persistence in browser storage
    expect(localStorage.getItem("apiKey")).toBeNull();
    expect(sessionStorage.getItem("apiKey")).toBeNull();
  });

  test("no-key: calling fetch functions without a key rejects immediately without calling global.fetch", async () => {
    expect(hasApiKey()).toBe(false);

    await expect(fetchNowPlayingMovie()).rejects.toThrow(
      "TMDB API key is missing. Please provide an API key in memory."
    );
    expect(global.fetch).not.toHaveBeenCalled();

    await expect(fetchSearchMovie("avatar")).rejects.toThrow(
      "TMDB API key is missing. Please provide an API key in memory."
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("success: resolves explicit or in-memory key and calls fetch with encoded URL", async () => {
    setApiKey(SYNTHETIC_KEY);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [{ id: 1, title: "Test Movie" }] }),
    });

    const data = await fetchNowPlayingMovie();
    expect(data.results[0].title).toBe("Test Movie");
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(calledUrl).toContain(`api_key=${SYNTHETIC_KEY}`);
  });

  test("error: non-200 HTTP responses throw sanitized error and redact the key", async () => {
    setApiKey(SYNTHETIC_KEY);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    });

    await expect(fetchNowPlayingMovie()).rejects.toThrow(
      "TMDB API request failed with HTTP 401"
    );

    // Verify key was not included in error message
    try {
      await fetchNowPlayingMovie();
    } catch (err: any) {
      expect(err.message).not.toContain(SYNTHETIC_KEY);
    }
  });

  test("no-network: network rejection does not leak the key", async () => {
    setApiKey(SYNTHETIC_KEY);
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error(`Connection failed to endpoint with ${SYNTHETIC_KEY}`)
    );

    await expect(fetchNowPlayingMovie()).rejects.toThrow();
    try {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error(`Connection failed to endpoint with ${SYNTHETIC_KEY}`)
      );
      await fetchNowPlayingMovie();
    } catch (err: any) {
      expect(err.message).not.toContain(SYNTHETIC_KEY);
      expect(err.message).toContain("[REDACTED_KEY]");
    }
  });
});
