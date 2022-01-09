import { useQuery } from "react-query";
import styled from "styled-components";
import {
  fetchNowPlayingMovie,
  fetchPopularMovie,
  fetchTopRatedMovie,
  fetchUpcomingMovie,
} from "../api";
import Slider from "../Components/Slider";
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
export interface iData {
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
  const { isLoading: nowPlayingLoading, data: nowPlayingData } =
    useQuery<iData>("nowPlaying", fetchNowPlayingMovie);
  const { isLoading: popularLoading, data: popularData } = useQuery<iData>(
    "latest",
    fetchPopularMovie
  );
  const { isLoading: topRatedLoading, data: topRatedData } = useQuery<iData>(
    "topRated",
    fetchTopRatedMovie
  );
  const { isLoading: upcomingLoading, data: upcomingData } = useQuery<iData>(
    "upcoming",
    fetchUpcomingMovie
  );
  return (
    <Container>
      <Banner
        bgPhoto={makeImgPath(nowPlayingData?.results[0].backdrop_path || "")}
      >
        {nowPlayingLoading ? (
          <BannerBox>
            <h1>불러오는 중...</h1>
          </BannerBox>
        ) : (
          <BannerBox>
            <h1>{nowPlayingData?.results[0].title}</h1>
            <h2>오늘 영화 순위 1위</h2>
            <h3>{nowPlayingData?.results[0].overview}</h3>
          </BannerBox>
        )}
      </Banner>
      <Slider
        loading={nowPlayingLoading}
        data={nowPlayingData}
        title="현재 상영 중"
      />
      {/* <Slider
        loading={popularLoading}
        data={popularData}
        title="지금 가장 인기있는 영화"
      />
      <Slider
        loading={topRatedLoading}
        data={topRatedData}
        title="높은 평점을 받은 작품들"
      />
      <Slider
        loading={upcomingLoading}
        data={upcomingData}
        title="출시 예정작"
      /> */}
    </Container>
  );
}

export default Home;