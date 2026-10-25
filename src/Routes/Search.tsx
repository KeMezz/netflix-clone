import { useEffect } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import { fetchSearchMovie, fetchSearchTv, setApiKey } from "../api";
import { apiKeyAtom } from "../atom";
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
  const apiKey = useRecoilValue(apiKeyAtom);

  useEffect(() => {
    setApiKey(apiKey);
  }, [apiKey]);

  const { isLoading: isMovieResultLoading, data: movieResultData } =
    useQuery<iSearchResults>(
      [keyword, "movieSearch", apiKey],
      () => fetchSearchMovie(keyword, apiKey),
      { enabled: Boolean(apiKey && keyword) }
    );
  const { isLoading: isTvResultLoading, data: tvResultData } =
    useQuery<iSearchResults>(
      [keyword, "tvSearch", apiKey],
      () => fetchSearchTv(keyword, apiKey),
      { enabled: Boolean(apiKey && keyword) }
    );

  if (!apiKey) {
    return <ApiKeyNotice />;
  }

  return (
    <>
      {movieResultData?.total_results === 0 && tvResultData?.total_results === 0 ? (
        <NoResults>검색 결과가 없습니다</NoResults>
      ) : (
        <SearchResults>
          {isMovieResultLoading || isTvResultLoading ? (
            <Loader>검색 중입니다...</Loader>
          ) : (
            <>
              {movieResultData?.total_results !== 0 && (
                <SearchMovieSlider
                  keyword={keyword}
                  loading={isMovieResultLoading}
                  data={movieResultData}
                  title="Movie Results"
                />
              )}
              {tvResultData?.total_results !== 0 && (
                <SearchTvSlider
                  keyword={keyword}
                  loading={isTvResultLoading}
                  data={tvResultData}
                  title="TV Results"
                />
              )}
            </>
          )}
        </SearchResults>
      )}
    </>
  );
}

export default Search;
