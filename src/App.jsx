import { Route, Routes,  BrowserRouter } from "react-router-dom";
import './App.css';
import MovieSearch from "./components/MovieSearch";
import MovieDetails from "./components/MovieDetails";
function App() {
    return (
    <BrowserRouter>
      <Routes>
        <Route index element={<MovieSearch />} />
        <Route path="details/:movieId" element={<MovieDetails />} />
      </Routes>
   </BrowserRouter>
    );
}
export default App;


/*
Home page:
  With no search, show list of topp movies (Cache this)

*/