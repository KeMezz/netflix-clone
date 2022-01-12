import { AnimatePresence, motion, Variants } from "framer-motion";
import { useQuery } from "react-query";
import { useMatch, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { fetchSearchResults } from "../api";
import MovieDetail from "../Components/MovieDetail";
import {
  Overlay,
  SlideInfoBox,
  slideInfoBoxVariants,
} from "../Components/MovieSlider";
import TvDetail from "../Components/TvDetail";
import { makeImgPath } from "../imgPath";

const SearchResults = styled.section`
  margin-top: 70px;
  padding: 100px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, auto));
  gap: 1vw;
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
const Result = styled(motion.div)`
  height: 15vh;
  font-size: 0.9vw;
  font-weight: 600;
  background-position: center;
  cursor: pointer;
`;

const ResultWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.6vw;
  position: relative;
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

interface iResults {
  page: number;
  results: iResultsData[];
  total_pages: number;
  total_results: number;
}

const resultVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.3,
    y: -50,
    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
    transition: {
      delay: 0.8,
      duration: 0.3,
    },
  },
};

function Search() {
  const navigate = useNavigate();
  const { keyword, movieId, tvId } = useParams();
  const { isLoading, data } = useQuery<iResults>([keyword, "search"], () =>
    fetchSearchResults(keyword)
  );
  const showMovieDetail = (movieId: number) => {
    navigate(`/search/${keyword}/movie/${movieId}`);
  };
  const showTvDetail = (tvId: number) => {
    navigate(`/search/${keyword}/tv/${tvId}`);
  };
  const movieDetailMatch = useMatch(`/search/:keyword/movie/:movieId`);
  const tvDetailMatch = useMatch(`/search/:keyword/tv/:tvId`);
  const onOverlayClick = () => navigate(-1);
  return (
    <>
      {data?.total_results === 0 ? (
        <NoResults>검색 결과가 없습니다</NoResults>
      ) : (
        <SearchResults>
          {isLoading ? (
            <Loader>검색 중입니다...</Loader>
          ) : (
            data?.results.map((result) => (
              <AnimatePresence>
                <Result
                  style={{
                    background: result.backdrop_path
                      ? `linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5)),
                  url(${makeImgPath(result.backdrop_path, "w500")})`
                      : "#000",
                    backgroundSize: "cover",
                  }}
                  layoutId={"검색결과" + result.id}
                  variants={resultVariants}
                  transition={{ type: "tween" }}
                  initial="initial"
                  whileHover="hover"
                  onClick={() =>
                    result.media_type === "movie"
                      ? showMovieDetail(result.id)
                      : showTvDetail(result.id)
                  }
                >
                  <ResultWrapper>
                    {result.backdrop_path ? null : "이미지가 없습니다"}
                    <SlideInfoBox variants={slideInfoBoxVariants}>
                      <h4>
                        {result.media_type === "movie"
                          ? result.title
                          : result.name}
                      </h4>
                      <h5>
                        {result.media_type === "movie"
                          ? result.original_title
                          : result.original_name}
                      </h5>
                      <p>⭐️{result.vote_average}</p>
                    </SlideInfoBox>
                  </ResultWrapper>
                </Result>
              </AnimatePresence>
            ))
          )}
        </SearchResults>
      )}
      {movieDetailMatch && (
        <>
          <AnimatePresence>
            <MovieDetail
              title="검색결과"
              movieId={Number(movieId)}
              key={movieId}
            />
            <Overlay
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onOverlayClick}
            />
          </AnimatePresence>
        </>
      )}
      {tvDetailMatch && (
        <>
          <AnimatePresence>
            <TvDetail title="검색결과" tvId={Number(tvId)} key={tvId} />
            <Overlay
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onOverlayClick}
            />
          </AnimatePresence>
        </>
      )}
    </>
  );
}

export default Search;
