import { Component, input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Movie } from '../../../core/models/movie.interface';
import { TmdbService } from '../../../core/services/tmdb.service';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.css',
})
export class MovieCardComponent {
  private tmdb = inject(TmdbService);

  movie = input.required<Movie>();

  get posterUrl(): string {
    return this.tmdb.getImageUrl(this.movie().poster_path, 'w500');
  }

  get year(): string {
    const date = this.movie().release_date;
    return date ? date.substring(0, 4) : 'N/A';
  }

  get rating(): string {
    return this.movie().vote_average.toFixed(1);
  }

  get ratingColor(): string {
    const avg = this.movie().vote_average;
    if (avg >= 7) return '#22c55e';
    if (avg >= 5) return '#eab308';
    return '#ef4444';
  }
}
