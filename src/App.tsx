import { createGlobalStyle, ThemeProvider } from "styled-components";
import Router from "./Router";
import { darkTheme } from "./theme";

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

function App() {
  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <GlobalStyle />
        <Router />
      </ThemeProvider>
    </>
  );
}

export default App;
