import { motion } from "framer-motion";
import { useQuery } from "react-query";
import styled from "styled-components";
import { fetchTvDetail } from "../api";
import { makeImgPath } from "../imgPath";

const DetailContainer = styled(motion.div)`
  z-index: 200;
  position: fixed;
  width: 80vw;
  max-width: 1000px;
  padding-bottom: 2vw;
  background-color: ${(props) => props.theme.bgColor.active};
  top: 10%;
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

const DetailText = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  padding: 0 1.4vw;
`;

const Credits = styled.div`
  display: flex;
  justify-content: center;
  gap: 1vw;
  p {
    font-size: 0.6vw;
  }
`;

const Genres = styled.div`
  display: flex;
  padding-top: 1.6vw;
  justify-content: center;
  gap: 0.4vw;
`;

const Genre = styled.div`
  padding: 4px 12px;
  background-color: crimson;
  width: fit-content;
  border-radius: 12px;
  font-size: 0.8vw;
  text-align: center;
`;

interface detailProps {
  title: string;
  tvId?: number;
}

interface iDetail {
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
  const { data } = useQuery<iDetail>([tvId, "tvDetail"], () =>
    fetchTvDetail(tvId)
  );
  return (
    <DetailContainer layoutId={title + tvId}>
      <motion.img
        src={makeImgPath(data?.backdrop_path || "")}
        alt={data?.name}
      />
      <DetailText>
        <h3>{data?.name}</h3>
        <h4>{data?.original_name}</h4>
        <p>{data?.overview}</p>
        <Credits>
          {data?.production_companies.map((item) => (
            <p key={item.name}>{item.name}</p>
          ))}
        </Credits>
        <Genres>
          {data?.genres.map((item) => (
            <Genre key={item.name}>{item.name}</Genre>
          ))}
        </Genres>
      </DetailText>
    </DetailContainer>
  );
}

export default TvDetail;
