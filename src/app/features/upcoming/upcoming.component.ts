import { Component, inject, OnInit, signal } from '@angular/core';
import { TmdbService } from '../../core/services/tmdb.service';
import { Movie } from '../../core/models/movie.interface';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';

@Component({
  selector: 'app-upcoming',
  standalone: true,
  imports: [MovieCardComponent],
  templateUrl: './upcoming.component.html',
  styleUrl: './upcoming.component.css',
})
export class UpcomingComponent implements OnInit {
  private tmdb = inject(TmdbService);

  movies = signal<Movie[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.isLoading.set(true);
    this.tmdb.getUpcomingMovies(this.currentPage()).subscribe({
      next: (res) => {
        this.movies.update((prev) => [...prev, ...res.results]);
        this.totalPages.set(res.total_pages);
        this.isLoading.set(false);
      },
    });
  }

  loadMore(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.loadMovies();
    }
  }
}
