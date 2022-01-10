import { Routes, Route, BrowserRouter } from "react-router-dom";
import Header from "./Components/Header";
import Home from "./Routes/Home";
import Search from "./Routes/Search";
import Tv from "./Routes/Tv";

function Router() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:movieId" element={<Home />} />
        <Route path="/tv" element={<Tv />} />
        <Route path="/tv/:tvId" element={<Tv />} />
        <Route path="/search/:keyword" element={<Search />} />
        <Route path="/search/:keyword/movie/:movieId" element={<Search />} />
        <Route path="/search/:keyword/tv/:tvId" element={<Search />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
