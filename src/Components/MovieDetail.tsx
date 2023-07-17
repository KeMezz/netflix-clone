import { motion } from "framer-motion";
import { useQuery } from "react-query";
import styled from "styled-components";
import { fetchMovieDetail } from "../api";
import { makeImgPath } from "../imgPath";
import { useNavigate } from "react-router-dom";

export const DetailContainer = styled(motion.div)`
  z-index: 200;
  position: fixed;
  width: 80vw;
  max-width: 800px;
  min-height: 50vh;
  top: 10%;
  padding-bottom: 2vw;
  background-color: ${(props) => props.theme.bgColor.active};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 30px;
  overflow: hidden;
  img {
    width: 100%;
    object-fit: cover;
  }
  h3 {
    padding-top: 20px;
    line-height: 1.4;
    font-size: 28px;
    text-align: center;
    font-weight: 600;
  }
  h4 {
    line-height: 1.4;
    font-size: 18px;
    text-align: center;
  }
  p {
    padding-top: 20px;
    line-height: 1.4;
    font-size: 16px;
  }
`;

export const NoImages = styled.div`
  padding: 150px;
`;

export const DetailText = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  padding: 0 1.4vw;
`;

export const Credits = styled.div`
  display: flex;
  justify-content: center;
  gap: 1vw;
  p {
    font-size: 0.6vw;
  }
`;

export const Genres = styled.div`
  display: flex;
  padding-top: 1.6vw;
  justify-content: center;
  gap: 0.4vw;
  text-align: center;
`;

export const Genre = styled.div`
  padding: 4px 12px;
  background-color: crimson;
  width: fit-content;
  border-radius: 12px;
  font-size: 0.8vw;
`;

export const CloseBtn = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  position: absolute;
  right: 12px;
  top: 12px;
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    background-color: #fff;
    color: #333;
  }
  svg {
    width: 30px;
    height: 30px;
  }
`;

interface detailProps {
  title: string;
  movieId?: number;
}

interface iMovieDetail {
  backdrop_path: string;
  genres: [{ id: number; name: string }];
  homepage: string;
  id: number;
  original_title: string;
  overview: string;
  poster_path: string;
  production_companies: [
    { id: number; logo_path: string; name: string; origin_country: string }
  ];
  release_date: string;
  tagline: string;
  title: string;
  vote_average: number;
  vote_count: number;
}

function MovieDetail({ movieId }: detailProps) {
  const { data: movieData } = useQuery<iMovieDetail>(
    [movieId, "movieDetail"],
    () => fetchMovieDetail(movieId)
  );
  const navigate = useNavigate();
  return (
    <DetailContainer
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ duration: 0.3 }}
    >
      <CloseBtn onClick={() => navigate(-1)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </CloseBtn>
      {movieData?.backdrop_path ? (
        <motion.img
          src={makeImgPath(movieData?.backdrop_path)}
          alt={movieData?.title}
        />
      ) : (
        <NoImages>No Images</NoImages>
      )}
      <DetailText>
        <h3>{movieData?.title}</h3>
        <h4>{movieData?.original_title}</h4>
        <p>{movieData?.overview}</p>
        <Credits>
          {movieData?.production_companies.map((item) => (
            <p key={item.name}>{item.name}</p>
          ))}
        </Credits>
        <Genres>
          {movieData?.genres.map((item) => (
            <Genre key={item.name}>{item.name}</Genre>
          ))}
        </Genres>
      </DetailText>
    </DetailContainer>
  );
}

export default MovieDetail;
