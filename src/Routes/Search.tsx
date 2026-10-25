import { useTmdbQuery } from "../tmdb";
import TmdbErrors from "../Components/TmdbErrors";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import { fetchSearchMovie, fetchSearchTv } from "../api";
import { apiSessionAtom } from "../atom";
import ApiKeyNotice from "../Components/ApiKeyNotice";
import SearchMovieSlider from "../Components/SearchMovieSlider";
import SearchTvSlider from "../Components/SearchTvSlider";

const SearchResults = styled.section`
  margin-top: 100px;
  display: flex;
  flex-direction: column;
`;
const Loader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  grid-column: 1 / -1;
`;
const NoResults = styled.div`
  margin-top: 70px;
  padding: 100px;
  display: flex;
  justify-content: center;
`;

interface iResultsData {
  backdrop_path: string;
  first_air_date: string;
  genre_ids: number[];
  id: number;
  media_type: string;
  name?: string;
  title?: string;
  origin_country: string[];
  original_language: string;
  original_name?: string;
  original_title?: string;
  overview: string;
  popularity: number;
  poster_path: string;
  vote_average: number;
  vote_count: number;
}

export interface iSearchResults {
  page: number;
  results: iResultsData[];
  total_pages: number;
  total_results: number;
}

function Search() {
  const { keyword } = useParams();
  const { enabled } = useRecoilValue(apiSessionAtom);

  const movieResultDataQuery = useTmdbQuery<iSearchResults>([keyword, "movieSearch"], (signal) => fetchSearchMovie(keyword, signal), Boolean(keyword));
  const { isLoading: isMovieResultLoading, data: movieResultData } = movieResultDataQuery;
  const tvResultDataQuery = useTmdbQuery<iSearchResults>([keyword, "tvSearch"], (signal) => fetchSearchTv(keyword, signal), Boolean(keyword));
  const { isLoading: isTvResultLoading, data: tvResultData } = tvResultDataQuery;

  if (!enabled) {
    return <ApiKeyNotice />;
  }

  return (
    <>
      <TmdbErrors queries={[["Movie Results", movieResultDataQuery], ["TV Results", tvResultDataQuery]]} />
      {movieResultData?.total_results === 0 && tvResultData?.total_results === 0 ? (
        <NoResults>검색 결과가 없습니다</NoResults>
      ) : (
        <SearchResults>
          {isMovieResultLoading || isTvResultLoading ? (
            <Loader>검색 중입니다...</Loader>
          ) : null}
            <>
              {Boolean(movieResultData?.total_results) && (
                <SearchMovieSlider
                  keyword={keyword}
                  loading={isMovieResultLoading}
                  data={movieResultData}
                  title="Movie Results"
                />
              )}
              {Boolean(tvResultData?.total_results) && (
                <SearchTvSlider
                  keyword={keyword}
                  loading={isTvResultLoading}
                  data={tvResultData}
                  title="TV Results"
                />
              )}
            </>
        </SearchResults>
      )}
    </>
  );
}

export default Search;
