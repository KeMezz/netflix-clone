import { motion } from "framer-motion";
import { useQuery } from "react-query";
import { fetchTvDetail } from "../api";
import { makeImgPath } from "../imgPath";
import {
  CloseBtn,
  Credits,
  DetailContainer,
  DetailText,
  Genre,
  Genres,
  NoImages,
} from "./MovieDetail";
import { useNavigate } from "react-router-dom";

interface detailProps {
  title: string;
  tvId?: number;
}

interface iTvDetail {
  backdrop_path: string;
  created_by: [
    {
      id: number;
      credit_id: string;
      name: string;
      gender: number;
      profile_path: string;
    }
  ];
  genres: [
    {
      id: number;
      name: string;
    }
  ];
  homepage: string;
  id: number;
  in_production: boolean;
  languages: string[];
  name: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: [
    {
      id: number;
      logo_path: string;
      name: string;
      origin_country: string;
    }
  ];
}

function TvDetail({ tvId }: detailProps) {
  const { data: tvData } = useQuery<iTvDetail>([tvId, "tvDetail"], () =>
    fetchTvDetail(tvId)
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
      {tvData?.backdrop_path ? (
        <motion.img
          src={makeImgPath(tvData?.backdrop_path)}
          alt={tvData?.name}
        />
      ) : (
        <NoImages>No Images</NoImages>
      )}
      <DetailText>
        <h3>{tvData?.name}</h3>
        <h4>{tvData?.original_name}</h4>
        <p>{tvData?.overview}</p>
        <Credits>
          {tvData?.production_companies.map((item) => (
            <p key={item.name}>{item.name}</p>
          ))}
        </Credits>
        <Genres>
          {tvData?.genres.map((item) => (
            <Genre key={item.name}>{item.name}</Genre>
          ))}
        </Genres>
      </DetailText>
    </DetailContainer>
  );
}

export default TvDetail;
