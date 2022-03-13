import { motion } from "framer-motion";
import { useQuery } from "react-query";
import { fetchTvDetail } from "../api";
import { makeImgPath } from "../imgPath";
import {
  Credits,
  DetailContainer,
  DetailText,
  Genre,
  Genres,
  NoImages,
} from "./MovieDetail";

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

function TvDetail({ title, tvId }: detailProps) {
  const { data: tvData } = useQuery<iTvDetail>([tvId, "tvDetail"], () =>
    fetchTvDetail(tvId)
  );
  return (
    <DetailContainer layoutId={title + tvId}>
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
