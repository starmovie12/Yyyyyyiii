import { Movie } from '../types';

const BASE_URL = "https://bhaag-df531-default-rtdb.firebaseio.com";

// Fallback mock data - Firebase se data na aaye tab use hoga
const MOCK_MOVIES: Movie[] = [
  {
    movie_id: "sample-1",
    title: "Big Buck Bunny",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    quality_name: "720P HD",
    poster: "https://picsum.photos/seed/bunny/500/750",
    rating: "8.5",
    year: "2024",
    genre: "Animation",
    short_description: "A short animated film about a big bunny.",
    director: "Sacha Goedegebure",
    cast: "N/A",
    industry: "Hollywood",
    runtime: "9m",
  },
  {
    movie_id: "sample-2",
    title: "Elephant Dream",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    quality_name: "1080P FHD",
    poster: "https://picsum.photos/seed/elephant/500/750",
    rating: "7.9",
    year: "2023",
    genre: "Action, Drama",
    short_description: "The first Blender Open Movie from 2006.",
    director: "Bassam Kurdali",
    cast: "N/A",
    industry: "Hollywood",
    runtime: "11m",
  },
  {
    movie_id: "sample-3",
    title: "For Bigger Blazes",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    quality_name: "HD",
    poster: "https://picsum.photos/seed/blaze/500/750",
    rating: "7.2",
    year: "2023",
    genre: "Action",
    short_description: "An action-packed short film.",
    industry: "Hollywood",
    runtime: "15m",
  },
  {
    movie_id: "sample-4",
    title: "Subaru Outback",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    quality_name: "4K",
    poster: "https://picsum.photos/seed/subaru/500/750",
    rating: "6.8",
    year: "2023",
    genre: "Horror, Thriller",
    short_description: "A cinematic drive through scenic landscapes.",
    industry: "Hollywood",
    runtime: "12m",
  },
];

export const fetchAllMovies = async (): Promise<Movie[]> => {
  try {
    const response = await fetch(`${BASE_URL}/movies_by_id.json`, {
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (!data || typeof data !== 'object') return MOCK_MOVIES;

    const movies = Object.values(data) as Movie[];
    return movies.length > 0 ? movies : MOCK_MOVIES;
  } catch (error) {
    console.warn("Firebase fetch failed, using mock data:", error);
    return MOCK_MOVIES;
  }
};

export const fetchMovieById = async (id: string): Promise<Movie | null> => {
  try {
    const response = await fetch(`${BASE_URL}/movies_by_id/${id}.json`, {
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (!data) {
      return MOCK_MOVIES.find(m => m.movie_id === id) || MOCK_MOVIES[0];
    }

    return data as Movie;
  } catch (error) {
    console.warn("Firebase fetch by id failed, using mock data:", error);
    return MOCK_MOVIES.find(m => m.movie_id === id) || MOCK_MOVIES[0];
  }
};
