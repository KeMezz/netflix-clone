import { useQuery } from "react-query";
import styled from "styled-components";
import { fetchPopularTvshows } from "../api";
import TvSlider from "../Components/TvSlider";
import { makeImgPath } from "../imgPath";

export interface iResults {
  backdrop_path: string;
  first_air_date: string;
  genre_ids: number[];
  id: number;
  name: string;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  vote_average: number;
  vote_count: number;
}
export interface iTvData {
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

function Tv() {
  const { isLoading: popularTvLoading, data: popularTvData } =
    useQuery<iTvData>("popularTv", fetchPopularTvshows);
  return (
    <Container>
      <Banner
        bgPhoto={makeImgPath(popularTvData?.results[0].backdrop_path || "")}
      >
        {popularTvLoading ? (
          <BannerBox>
            <h1>불러오는 중...</h1>
          </BannerBox>
        ) : (
          <BannerBox>
            <h1>{popularTvData?.results[0].name}</h1>
            <h2>현재 인기 TV 시리즈 1위</h2>
            <h3>{popularTvData?.results[0].overview}</h3>
          </BannerBox>
        )}
      </Banner>
      <TvSlider
        loading={popularTvLoading}
        data={popularTvData}
        title="가장 인기 있는 TV 시리즈"
      />
    </Container>
  );
}

export default Tv;
