import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MovieResponse, Movie } from '../models/movie.model';
import { CreditsResponse } from '../models/cast.model';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private http = inject(HttpClient);
  private apiUrl = environment.baseUrl;

  // CACHE DE SIGNALS PERSISTENTES (Evita la renderización de Skeletons al volver a la Home)
  public trendingMoviesCache = signal<Movie[]>([]);
  public popularMoviesCache = signal<Movie[]>([]);
  public catalogMoviesCache = signal<Movie[]>([]);
  public currentPageCache = signal<number>(1);

  // ID de la película activa para la View Transition (evita duplicados de view-transition-name)
  public activeTransitionMovieId = signal<number | null>(null);
  public activeTransitionContext = signal<string>('default');

  getTrendingMovies() {
    return this.http.get<MovieResponse>(`${this.apiUrl}/trending/movie/day`);
  }

  getPopularMovies(page: number = 1) {
    return this.http.get<MovieResponse>(`${this.apiUrl}/movie/popular`, {
      params: { page: page.toString() }
    });
  }

  getMovieById(id: string | number) {
    return this.http.get<Movie>(`${this.apiUrl}/movie/${id}`);
  }

  getMovieCredits(id: string | number) {
    return this.http.get<CreditsResponse>(`${this.apiUrl}/movie/${id}/credits`);
  }

  getMovieVideos(id: string | number) {
    return this.http.get<{ results: Array<{key: string; site: string; type: string; name: string}> }>(
      `${this.apiUrl}/movie/${id}/videos`
    );
  }

  searchMovies(query: string) {
    return this.http.get<MovieResponse>(`${this.apiUrl}/search/movie`, {
      params: { query }
    });
  }
}
