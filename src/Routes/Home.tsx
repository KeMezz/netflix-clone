import { useTmdbQuery } from "../tmdb";
import TmdbErrors from "../Components/TmdbErrors";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import {
  fetchLatestMovie,
  fetchNowPlayingMovie,
  fetchTopRatedMovie,
  fetchUpcomingMovie,
} from "../api";
import { apiSessionAtom } from "../atom";
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
  const { enabled } = useRecoilValue(apiSessionAtom);

  const nowPlayingDataQuery = useTmdbQuery<iMovieData>(["nowPlayingMovie"], (signal) => fetchNowPlayingMovie(signal));
  const { isLoading: nowPlayingLoading, data: nowPlayingData } = nowPlayingDataQuery;
  const topRatedMovieQuery = useTmdbQuery<iMovieData>(["topRatedMovie"], (signal) => fetchTopRatedMovie(signal));
  const { isLoading: topRatedMovieLoading, data: topRatedMovie } = topRatedMovieQuery;
  const upcomingMovieQuery = useTmdbQuery<iMovieData>(["upcomingMovie"], (signal) => fetchUpcomingMovie(signal));
  const { isLoading: upcomingMovieLoading, data: upcomingMovie } = upcomingMovieQuery;
  const latestMovieQuery = useTmdbQuery<iMovieData>(["latestMovie"], (signal) => fetchLatestMovie(signal));
  const { isLoading: latestMovieLoading, data: latestMovie } = latestMovieQuery;

  if (!enabled) {
    return (
      <Container>
        <ApiKeyNotice />
      </Container>
    );
  }

  return (
    <Container>
      <TmdbErrors queries={[["Now Playing", nowPlayingDataQuery], ["Top Rated", topRatedMovieQuery], ["Upcoming", upcomingMovieQuery], ["Latest", latestMovieQuery]]} />
      <Banner
        bgPhoto={makeImgPath(nowPlayingData?.results?.[0]?.backdrop_path || "")}
      >
        {nowPlayingLoading ? (
          <BannerBox>
            <h1>불러오는 중...</h1>
          </BannerBox>
        ) : nowPlayingData ? (
          <BannerBox>
            <h1>{nowPlayingData?.results?.[0]?.title}</h1>
            <h2>오늘 영화 순위 1위</h2>
            <h3>{nowPlayingData?.results?.[0]?.overview}</h3>
          </BannerBox>
        ) : null}
      </Banner>
      {nowPlayingData && <MovieSlider
        loading={nowPlayingLoading}
        data={nowPlayingData}
        title="Now Playing"
      />}
      {latestMovie && <MovieSlider
        loading={latestMovieLoading}
        data={latestMovie}
        title="Latest"
      />}
      {topRatedMovie && <MovieSlider
        loading={topRatedMovieLoading}
        data={topRatedMovie}
        title="Top Rated"
      />}
      {upcomingMovie && <MovieSlider
        loading={upcomingMovieLoading}
        data={upcomingMovie}
        title="Upcoming"
      />}
    </Container>
  );
}

export default Home;
