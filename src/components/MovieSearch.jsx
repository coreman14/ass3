import { useEffect, useState, useMemo } from "react";
import MovieList from "./MovieList";

export default function MovieSearch() {
    const [searchString, setSearchString] = useState("");
    const [genres, setGenres] = useState([]);
    const [currentGenre, setCurrentGenre] = useState(-1);
    const [results, setResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [maxPage, setMaxPage] = useState(50);
    const api = import.meta.env.VITE_API_KEY;
    const options = useMemo(() => {
        return {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${api}`,
            },
        };
    }, [api]);

    const showSearchResults = searchString != "";
    useEffect(() => {
        fetch("https://api.themoviedb.org/3/genre/movie/list", options)
            .then((res) => res.json())
            .then((results) => setGenres(results.genres))
            .catch((err) => console.error(err));
    }, [options]);
    useEffect(() => {
        if (genres.length > 0) {
            const timeoutId = setTimeout(() => {
                const fetchUrl = showSearchResults
                    ? `https://api.themoviedb.org/3/search/movie?query=${searchString}&page=${currentPage}`
                    : `https://api.themoviedb.org/3/movie/top_rated?page=${currentPage}`;
                fetch(fetchUrl, options)
                    .then((res) => res.json())
                    .then((results) => {
                        setMaxPage(results.total_pages);
                        results = results.results.filter(
                            (x) => currentGenre == -1 || x.genre_ids.includes(currentGenre),
                        );
                        results.forEach((element) => {
                            element.genre_ids = element.genre_ids.map((x) => genres.find((y) => y.id == x).name);
                        });
                        setResults(results);
                    })
                    .catch((err) => console.error(err));
            }, 500);

            return () => clearTimeout(timeoutId);
        }
    }, [currentPage, searchString, showSearchResults, genres, options, currentGenre]);
    const isSearchActive = searchString.trim().length > 0;
    const calculatePages = () => {
        const pages = [];
        const maxVisible = 5;

        let start = Math.max(1, currentPage - 3);
        let end = Math.min(maxPage, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
        pages.push(i);
        }

        return pages;
    };



    return (
        <div className="movie-search-page">
            <header className="movie-search-header">
                <label htmlFor="movie-search-input">Search movies</label>
                <input
                    id="movie-search-input"
                    type="text"
                    placeholder="Enter movie name"
                    value={searchString}
                    onChange={(e) => {
                        setSearchString(e.currentTarget.value);
                        setCurrentPage(1);
                    }}
                />

                <label htmlFor="genre-select">Filter by genre</label>
                <select
                    id="genre-select"
                    value={currentGenre}
                    onChange={(e) => {
                        setCurrentGenre(Number(e.currentTarget.value));
                        setCurrentPage(1);
                    }}
                >
                    <option value={-1}>All genres</option>
                    {genres.map((x) => (
                        <option value={x.id} key={x.id}>
                            {x.name}
                        </option>
                    ))}
                </select>
            </header>

            <section className="movie-results">
                <h2>{isSearchActive ? "Search Results" : "Top Rated Movies"}</h2>
                {results.length === 0 ? (
                    <div className="movie-none">No movies available.</div>
                ) : (
                    <MovieList movies={results} />
                )}
            </section>

            <nav className="pagination-nav">
                <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                    Previous
                </button>

                {calculatePages().map((i) => 
                        <button
                            key={i}
                            type="button"
                            className={i === currentPage ? "pagination-current" : ""}
                            onClick={() => setCurrentPage(i)}
                        >
                            {i}
                        </button>

                )}
                <button
                    type="button"
                    disabled={currentPage >= maxPage}
                    onClick={() => setCurrentPage((p) => Math.min(maxPage, p + 1))}
                >
                    Next
                </button>

                <span className="pagination-summary">
                    Page {currentPage} of {maxPage}
                </span>
            </nav>
        </div>
    );
}
