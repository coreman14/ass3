/* eslint-disable no-undef */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import MovieSearch from "./MovieSearch";

function mockMovieSearchFetch({ genres, byPage, byQuery }) {
    global.fetch = vi.fn((url) => {
        const requestUrl = typeof url === "string" ? url : url.url;

        if (requestUrl.includes("/genre/movie/list")) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ genres }),
            });
        }

        if (requestUrl.includes("top_rated")) {
            const pageMatch = requestUrl.match(/page=(\d+)/);
            const page = pageMatch ? Number(pageMatch[1]) : 1;
            const payload = byPage[page] ?? byPage[1];

            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(payload),
            });
        }

        if (requestUrl.includes("/search/movie")) {
            const queryMatch = requestUrl.match(/query=([^&]+)/);
            const query = queryMatch ? decodeURIComponent(queryMatch[1]) : "";
            const payload = byQuery[query] ?? { total_pages: 1, results: [] };

            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(payload),
            });
        }

        return Promise.reject(new Error("Unknown API call"));
    });
}

beforeEach(() => {
    mockMovieSearchFetch({
        genres: [{ id: 1, name: "Action" }],
        byPage: { 1: { total_pages: 1, results: [] } },
        byQuery: { hgbkhjdglkusdhsdiuglhsdli: { total_pages: 1, results: [] } },
    });
});

afterEach(() => {
    vi.clearAllMocks();
});

test("shows no results for bad query", async () => {
    const user = userEvent.setup();

    render(
        <MemoryRouter>
            <MovieSearch />
        </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText("Enter movie name");
    await user.type(input, "hgbkhjdglkusdhsdiuglhsdli");

    expect(await screen.findByText(/No movies available/i)).toBeInTheDocument();
});

test("filters movies by selected genre and remaining cards include that genre in hidden input", async () => {
    const user = userEvent.setup();
    mockMovieSearchFetch({
        genres: [
            { id: 1, name: "Action" },
            { id: 2, name: "Comedy" },
        ],
        byPage: {
            1: {
                total_pages: 1,
                results: [
                    {
                        id: 101,
                        title: "Action Hero",
                        vote_average: 8.2,
                        release_date: "2020-01-01",
                        poster_path: null,
                        genre_ids: [1],
                    },
                    {
                        id: 102,
                        title: "Comedy Night",
                        vote_average: 7.1,
                        release_date: "2021-02-02",
                        poster_path: null,
                        genre_ids: [2],
                    },
                ],
            },
        },
        byQuery: {},
    });

    const { container } = render(
        <MemoryRouter>
            <MovieSearch />
        </MemoryRouter>,
    );

    await screen.findByText("Action Hero");
    await screen.findByText("Comedy Night");

    await user.selectOptions(screen.getByLabelText("Filter by genre"), "1");

    expect(screen.getByText("Action Hero")).toBeInTheDocument();
    expect(screen.queryByText("Comedy Night")).not.toBeInTheDocument();

    const hiddenGenreInputs = Array.from(container.querySelectorAll('input[type="hidden"]'));
    expect(hiddenGenreInputs.length).toBeGreaterThan(0);
    hiddenGenreInputs.forEach((input) => {
        console.log(input.value);
        expect(input).toHaveValue("Action");
    });
});

test("pagination next and previous update current page number", async () => {
    const user = userEvent.setup();
    mockMovieSearchFetch({
        genres: [{ id: 1, name: "Action" }],
        byPage: {
            1: {
                total_pages: 3,
                results: [
                    {
                        id: 201,
                        title: "Page One Movie",
                        vote_average: 7.2,
                        release_date: "2022-03-03",
                        poster_path: null,
                        genre_ids: [1],
                    },
                ],
            },
            2: {
                total_pages: 3,
                results: [
                    {
                        id: 202,
                        title: "Page Two Movie",
                        vote_average: 7.6,
                        release_date: "2023-04-04",
                        poster_path: null,
                        genre_ids: [1],
                    },
                ],
            },
        },
        byQuery: {},
    });

    render(
        <MemoryRouter>
            <MovieSearch />
        </MemoryRouter>,
    );

    expect(await screen.findByText(/Page 1 of 3/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText(/Page 2 of 3/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(await screen.findByText(/Page 1 of 3/i)).toBeInTheDocument();
});

test("shows error when movie ID does not exist", async () => {
    if (!document.getElementById("root-details")) {
        const portalTarget = document.createElement("div");
        portalTarget.setAttribute("id", "root-details");
        document.body.appendChild(portalTarget);
    }

    global.fetch = vi.fn(() =>
        Promise.resolve({
            ok: false,
            json: () => Promise.resolve({}),
        }),
    );

    const { default: MovieDetails } = await import("./MovieDetails");

    render(
        <MemoryRouter initialEntries={["/details/9999"]}>
            <Routes>
                <Route path="/details/:movieId" element={<MovieDetails />} />
            </Routes>
        </MemoryRouter>,
    );

    expect(await screen.findByText(/Error: Could not find movie ID: 9999/i)).toBeInTheDocument();
});
