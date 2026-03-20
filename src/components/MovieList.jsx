import { Link } from "react-router-dom";

export default function MovieList({ movies }) {
    if (!movies || movies.length === 0) {
        return <div className="movie-list-empty">No movies found</div>;
    }

    return (
        <div className="movie-grid">
            {movies.map((movie) => {
                const thumb = movie.poster_path
                    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                    : "https://via.placeholder.com/342x513?text=No+Poster";

                const year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";

                return (
                    <article className="movie-card" key={movie.id}>
                        <Link to={`/details/${movie.id}`} className="movie-link">
                            <img className="movie-poster" src={thumb} alt={`Poster for ${movie.title}`} />
                            <div className="movie-info">
                                <h2>{movie.title}</h2>
                                <div className="movie-meta">
                                    <span>{movie.vote_average ? movie.vote_average.toFixed(1) : "--"} ★</span>
                                    <span>{year}</span>
                                </div>
                            </div>
                        </Link>
                    </article>
                );
            })}
        </div>
    );
}
