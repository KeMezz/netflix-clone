import { useRecoilValue } from "recoil";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import { windowSizeAtom } from "./atom";
import Router from "./Router";
import { darkTheme } from "./theme";
import { useWindowSize } from "./useWindowSize";

const GlobalStyle = createGlobalStyle`
  body {
    overflow-x: hidden;
    background-color: ${(props) => props.theme.bgColor.default};
    color: ${(props) => props.theme.textColor.default};
  }
  button {
    border: none;
    background-color: transparent;
    color: ${(props) => props.theme.textColor.default};
  }
  input {
    outline: none;
    color: ${(props) => props.theme.textColor.default};
    &::placeholder {
    color: ${(props) => props.theme.textColor.default};
  }
  }
`;

const MobileWarning = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  gap: 3vh;
  i {
    font-size: 6vw;
    color: yellow;
  }
  h1 {
    font-size: 4vw;
    font-weight: 700;
  }
`;

function App() {
  useWindowSize();
  const windowSize = useRecoilValue(windowSizeAtom);
  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <GlobalStyle />
        {windowSize.width > 1200 ? (
          <Router />
        ) : (
          <MobileWarning
            style={{ width: window.innerWidth, height: window.innerHeight }}
          >
            <i className="fas fa-exclamation-triangle" />
            <h1>모바일 버전은 아직 지원되지 않습니다.</h1>
          </MobileWarning>
        )}
      </ThemeProvider>
    </>
  );
}

export default App;
