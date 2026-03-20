import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useParams } from "react-router-dom";

const portalRoot = document.getElementById("root-details");
export default function MovieDetails() {
    const [fetched, setFetched] = useState(false);
    const [details, setDetails] = useState(null);
    const [error, setError] = useState(null);
    const api = import.meta.env.VITE_API_KEY;
    const { movieId } = useParams();

    useEffect(() => {
        fetch("https://api.themoviedb.org/3/movie/" + movieId + "?append_to_response=credits", {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${api}`,
            },
        })
            .then((x) => x.json())
            .then((x) => {
                setDetails(x);
            })
            .catch((e) => setError(e))
            .finally(() => setFetched(true));
    }, [api, movieId]);

    const content = () => {
        if (!fetched) {
            return <div>Loading movie details...</div>;
        }

        if (error) {
            return <div className="movie-error">Error: {error}</div>;
        }

        if (!details) {
            return <div className="movie-error">Movie details could not be loaded.</div>;
        }

        const cast = !details.credits?.cast?.length ? <><div className="movie-cast-empty">Cast information unavailable</div></>: 
                    <ul className="movie-cast-list">
                {details.credits.cast.slice(0, 5).map((actor) => (
                    <li key={actor.cast_id || actor.credit_id || actor.id}>
                        <strong>{actor.name}</strong> as {actor.character || "Unknown"}
                    </li>
                ))}
            </ul>
        const releaseYear = details.release_date ? details.release_date.split("-")[0] : "Unknown";

        return (
            <article className="movie-details-card">
                <h1>{details.title || "Untitled"}</h1>
                <div className="movie-subtitle">
                    <span>{releaseYear}</span>
                    <span>{details.vote_average ? details.vote_average.toFixed(1) : "--"} ★</span>
                </div>
                <p className="movie-overview">{details.overview || "No overview available."}</p>
                <section className="movie-cast">
                    <h2>Top Cast</h2>
                    {cast}
                </section>
            </article>
        );
    };

    return createPortal(
        <div className="movie-details-wrapper">
            <Link to="/" className="movie-back-link">
                ← Back to Search
            </Link>
            {content()}
        </div>,
        portalRoot,
    );
}
