import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TmdbService } from '../../core/services/tmdb.service';
import { Movie } from '../../core/models/movie.interface';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [MovieCardComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private tmdb = inject(TmdbService);

  results = signal<Movie[]>([]);
  query = signal('');
  totalResults = signal(0);
  isLoading = signal(false);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const q = params['q'] || '';
      if (q) {
        this.query.set(q);
        this.performSearch(q);
      }
    });
  }

  private performSearch(query: string): void {
    this.isLoading.set(true);
    this.tmdb.searchMovies(query).subscribe({
      next: (res) => {
        this.results.set(res.results);
        this.totalResults.set(res.total_results);
        this.isLoading.set(false);
      },
    });
  }
}
