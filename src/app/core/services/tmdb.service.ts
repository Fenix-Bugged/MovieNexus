import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import {
  Movie,
  MovieResponse,
  MovieDetail,
  Credits,
  VideoResponse,
  Genre,
} from '../models/movie.interface';

@Injectable({
  providedIn: 'root',
})
export class TmdbService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  // ─── Trending ──────────────────────────────────────────────
  getTrending(timeWindow: 'day' | 'week' = 'week'): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/trending/movie/${timeWindow}`,
    );
  }

  // ─── Popular / Top Rated / Upcoming / Now Playing ──────────
  getPopularMovies(page: number = 1): Observable<MovieResponse> {
    const params = new HttpParams().set('page', page);
    return this.http.get<MovieResponse>(`${this.baseUrl}/movie/popular`, {
      params,
    });
  }

  getTopRatedMovies(page: number = 1): Observable<MovieResponse> {
    const params = new HttpParams().set('page', page);
    return this.http.get<MovieResponse>(`${this.baseUrl}/movie/top_rated`, {
      params,
    });
  }

  getUpcomingMovies(page: number = 1): Observable<MovieResponse> {
    const params = new HttpParams().set('page', page);
    return this.http.get<MovieResponse>(`${this.baseUrl}/movie/upcoming`, {
      params,
    });
  }

  getNowPlayingMovies(page: number = 1): Observable<MovieResponse> {
    const params = new HttpParams().set('page', page);
    return this.http.get<MovieResponse>(`${this.baseUrl}/movie/now_playing`, {
      params,
    });
  }

  // ─── Movie Details ─────────────────────────────────────────
  getMovieDetail(id: number): Observable<MovieDetail> {
    return this.http.get<MovieDetail>(`${this.baseUrl}/movie/${id}`);
  }

  getMovieCredits(id: number): Observable<Credits> {
    return this.http.get<Credits>(`${this.baseUrl}/movie/${id}/credits`);
  }

  getMovieVideos(id: number): Observable<VideoResponse> {
    return this.http.get<VideoResponse>(`${this.baseUrl}/movie/${id}/videos`);
  }

  getSimilarMovies(id: number): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(`${this.baseUrl}/movie/${id}/similar`);
  }

  // ─── Search ────────────────────────────────────────────────
  searchMovies(query: string, page: number = 1): Observable<MovieResponse> {
    const params = new HttpParams().set('query', query).set('page', page);
    return this.http.get<MovieResponse>(`${this.baseUrl}/search/movie`, {
      params,
    });
  }

  // ─── Genres ────────────────────────────────────────────────
  getGenres(): Observable<{ genres: Genre[] }> {
    return this.http.get<{ genres: Genre[] }>(
      `${this.baseUrl}/genre/movie/list`,
    );
  }

  // ─── Discover by Genre ────────────────────────────────────
  discoverByGenre(
    genreId: number,
    page: number = 1,
  ): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('with_genres', genreId)
      .set('page', page)
      .set('sort_by', 'popularity.desc');
    return this.http.get<MovieResponse>(`${this.baseUrl}/discover/movie`, {
      params,
    });
  }

  // ─── Image Helper ─────────────────────────────────────────
  getImageUrl(
    path: string | null,
    size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500',
  ): string {
    if (!path) {
      return 'assets/no-image.png';
    }
    return `${environment.imgPath}/${size}${path}`;
  }
}
