import { AnimatePresence, motion, Variants } from "framer-motion";
import { useState } from "react";
import { useMatch, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { makeImgPath } from "../imgPath";
import { iMovieData } from "../Routes/Home";
import MovieDetail from "./MovieDetail";

interface sliderProps {
  loading: boolean;
  data?: iMovieData;
  title: string;
}

export const SlideTitle = styled.h3`
  font-size: 1.2vw;
  padding-left: 50px;
  padding-bottom: 1vw;
  font-weight: 500;
  @media (max-width: 600px) {
    padding-left: 18px;
  }
`;

export const SlideContainer = styled.section`
  width: 100vw;
  height: 8vw;
  position: relative;
  margin-bottom: 4vw;
  .fas {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    width: 50px;
    height: 100%;
    font-size: 1.5vw;
    top: 0;
    filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.5));
    z-index: 1;
    cursor: pointer;
    transition: transform 0.3s ease-in-out;
    &:hover {
      transform: scale(120%);
      color: ${(props) => props.theme.textColor.active};
    }
    @media (max-width: 600px) {
      width: 18px;
    }
  }
  .fa-chevron-left {
    left: 0;
  }
  .fa-chevron-right {
    right: 0;
  }
`;
export const SlideRow = styled(motion.div)`
  position: absolute;
  width: 100vw;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5vw;
  padding: 0 50px;
  @media (max-width: 600px) {
    padding: 0 18px;
  }
`;
export const SlideBox = styled(motion.div)<{ bgPhoto: string }>`
  height: 8vw;
  font-size: 0.9vw;
  font-weight: 600;
  background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5)),
    url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center;
  cursor: pointer;
  &:first-child {
    transform-origin: left center;
  }
  &:last-child {
    transform-origin: right center;
  }
`;

export const SlideBoxWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  padding: 0.6vw;
  position: relative;
`;

export const SlideInfoBox = styled(motion.div)`
  pointer-events: none;
  opacity: 0;
  width: 100%;
  background-color: ${(props) => props.theme.bgColor.active};
  padding: 0.8vw;
  position: absolute;
  top: 100%;
  left: 0;
  line-height: 1.5;
  h4 {
    font-size: 0.8vw;
  }
  h5 {
    font-size: 10px;
  }
  p {
    margin-top: 10px;
    font-size: 8px;
  }
`;

export const Overlay = styled(motion.div)`
  background-color: rgba(0, 0, 0, 0.3);
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 50;
  opacity: 0;
`;

export const slideRowVariants: Variants = {
  initial: (right) => ({
    x: right ? window.outerWidth : -window.outerWidth,
  }),
  animate: {
    x: 0,
  },
  exit: (right) => ({
    x: right ? -window.outerWidth : window.outerWidth,
  }),
};

export const slideBoxVariants: Variants = {
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

export const slideInfoBoxVariants: Variants = {
  initial: {
    opacity: 0,
  },
  hover: {
    opacity: 1,
    pointerEvents: "auto",
    transition: {
      delay: 0.8,
      duration: 0.3,
    },
  },
};

function MovieSlider({ loading, data, title }: sliderProps) {
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
  const detailMatch = useMatch("/movie/:movieId");
  const navigate = useNavigate();
  const showDetail = (movieId: number) => navigate(`/movie/${movieId}`);
  const { movieId } = useParams();
  const onOverlayClick = () => navigate(-1);
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
                      <h4>{item.title}</h4>
                      <h5>{item.original_title}</h5>
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
            <MovieDetail
              title={title}
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
      ) : null}
    </>
  );
}

export default MovieSlider;
