import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useMatch, useNavigate, useParams } from "react-router-dom";
import { makeImgPath } from "../imgPath";
import { iTvData } from "../Routes/Tv";
import {
  Overlay,
  SlideBox,
  slideBoxVariants,
  SlideBoxWrapper,
  SlideContainer,
  SlideInfoBox,
  slideInfoBoxVariants,
  SlideRow,
  slideRowVariants,
  SlideTitle,
} from "./MovieSlider";
import TvDetail from "./TvDetail";

interface sliderProps {
  loading: boolean;
  data?: iTvData;
  title: string;
}

function TvSlider({ loading, data, title }: sliderProps) {
  let offset = 6;
  const [index, setIndex] = useState(0);
  const [right, setRight] = useState(true);
  const increaseIndex = () => {
    setRight(true);
    setIndex((prev) => (offset * index + offset > 17 ? 0 : prev + 1));
  };
  const decreaseIndex = () => {
    setRight(false);
    setIndex((prev) => (index === 0 ? 2 : prev - 1));
  };
  const detailMatch = useMatch("/tv/:tvId");
  const navigate = useNavigate();
  const showDetail = (tvId: number) => navigate(`/tv/${tvId}`);
  const { tvId } = useParams();
  const onOverlayClick = () => navigate("/tv");
  return (
    <>
      <SlideTitle>{loading ? "불러오는 중..." : title}</SlideTitle>
      <SlideContainer>
        <i className="fas fa-chevron-left" onClick={decreaseIndex}></i>
        <AnimatePresence initial={false} custom={right}>
          <SlideRow
            key={index}
            custom={right}
            variants={slideRowVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5 }}
            exit="exit"
          >
            {data?.results
              .slice(1)
              .slice(offset * index, offset * index + offset)
              .map((item) => (
                <SlideBox
                  layoutId={title + item.id}
                  key={item.id}
                  variants={slideBoxVariants}
                  transition={{ type: "tween" }}
                  initial="initial"
                  whileHover="hover"
                  bgPhoto={makeImgPath(item.backdrop_path || "", "w500")}
                  onClick={() => showDetail(item.id)}
                >
                  <SlideBoxWrapper>
                    <SlideInfoBox variants={slideInfoBoxVariants}>
                      <h4>{item.name}</h4>
                      <h5>{item.original_name}</h5>
                      <p>⭐️{item.vote_average}</p>
                    </SlideInfoBox>
                  </SlideBoxWrapper>
                </SlideBox>
              ))}
          </SlideRow>
        </AnimatePresence>
        <i className="fas fa-chevron-right" onClick={increaseIndex}></i>
      </SlideContainer>
      {detailMatch ? (
        <>
          <AnimatePresence>
            <TvDetail title={title} tvId={Number(tvId)} key={tvId} />
            <Overlay
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onOverlayClick}
            />
          </AnimatePresence>
        </>
      ) : null}
    </>
  );
}

export default TvSlider;
