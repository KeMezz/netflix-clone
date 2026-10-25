import { useEffect } from "react";
import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import {
  fetchLatestMovie,
  fetchNowPlayingMovie,
  fetchTopRatedMovie,
  fetchUpcomingMovie,
  setApiKey,
} from "../api";
import { apiKeyAtom } from "../atom";
import ApiKeyNotice from "../Components/ApiKeyNotice";
import MovieSlider from "../Components/MovieSlider";
import { makeImgPath } from "../imgPath";

export interface iResults {
  adult: boolean;
  backdrop_path: string;
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}
export interface iMovieData {
  results: [iResults];
}

const Container = styled.main``;

const Banner = styled.section<{ bgPhoto: string }>`
  display: flex;
  align-items: flex-end;
  padding: 0 50px;
  width: 100vw;
  height: 90vh;
  background-image: linear-gradient(#141414, transparent, #141414),
    url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center;
  @media (max-width: 600px) {
    padding: 0 18px;
  }
`;
const BannerBox = styled.div`
  margin-bottom: 120px;
  h1 {
    font-size: 2.8vw;
    font-weight: 700;
    line-height: 1.5;
    padding-bottom: 20px;
  }
  h2 {
    font-size: 1.5vw;
    font-weight: 600;
    padding-bottom: 20px;
  }
  h3 {
    font-size: 1vw;
    font-weight: 500;
    width: 80%;
    max-width: 1400px;
    line-height: 1.4;
  }
`;

function Home() {
  const apiKey = useRecoilValue(apiKeyAtom);

  useEffect(() => {
    setApiKey(apiKey);
  }, [apiKey]);

  const { isLoading: nowPlayingLoading, data: nowPlayingData } =
    useQuery<iMovieData>(
      ["nowPlayingMovie", apiKey],
      () => fetchNowPlayingMovie(apiKey),
      { enabled: Boolean(apiKey) }
    );
  const { isLoading: topRatedMovieLoading, data: topRatedMovie } =
    useQuery<iMovieData>(
      ["topRatedMovie", apiKey],
      () => fetchTopRatedMovie(apiKey),
      { enabled: Boolean(apiKey) }
    );
  const { isLoading: upcomingMovieLoading, data: upcomingMovie } =
    useQuery<iMovieData>(
      ["upcomingMovie", apiKey],
      () => fetchUpcomingMovie(apiKey),
      { enabled: Boolean(apiKey) }
    );
  const { isLoading: latestMovieLoading, data: latestMovie } =
    useQuery<iMovieData>(
      ["latestMovie", apiKey],
      () => fetchLatestMovie(apiKey),
      { enabled: Boolean(apiKey) }
    );

  if (!apiKey) {
    return (
      <Container>
        <ApiKeyNotice />
      </Container>
    );
  }

  return (
    <Container>
      <Banner
        bgPhoto={makeImgPath(nowPlayingData?.results?.[0]?.backdrop_path || "")}
      >
        {nowPlayingLoading ? (
          <BannerBox>
            <h1>불러오는 중...</h1>
          </BannerBox>
        ) : (
          <BannerBox>
            <h1>{nowPlayingData?.results?.[0]?.title}</h1>
            <h2>오늘 영화 순위 1위</h2>
            <h3>{nowPlayingData?.results?.[0]?.overview}</h3>
          </BannerBox>
        )}
      </Banner>
      <MovieSlider
        loading={nowPlayingLoading}
        data={nowPlayingData}
        title="Now Playing"
      />
      <MovieSlider
        loading={latestMovieLoading}
        data={latestMovie}
        title="Latest"
      />
      <MovieSlider
        loading={topRatedMovieLoading}
        data={topRatedMovie}
        title="Top Rated"
      />
      <MovieSlider
        loading={upcomingMovieLoading}
        data={upcomingMovie}
        title="Upcoming"
      />
    </Container>
  );
}

export default Home;
