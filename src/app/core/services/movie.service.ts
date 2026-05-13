import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { MovieResponse } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getTrendingMovies(): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(`${this.apiUrl}/trending/movie/day`);
  }
}
