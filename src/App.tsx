import { createGlobalStyle, ThemeProvider } from "styled-components";
import Header from "./Components/Header";
import Router from "./Router";
import { darkTheme } from "./theme";

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${(props) => props.theme.bgColor};
    color: ${(props) => props.theme.textColor.default};
    height: 300vh;
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
        <Header />
        <Router />
      </ThemeProvider>
    </>
  );
}

export default App;
