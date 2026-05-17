import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovieService } from '../../../core/services/movie.service';
import { Movie } from '../../../core/models/movie.model';
import { MovieResponse } from '../../../core/models/movie.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  private movieService = inject(MovieService);

  // Signals para manejar el estado del buscador
  searchQuery = signal<string>('');
  searchResults = signal<Movie[]>([]);
  isSearching = signal<boolean>(false);

  constructor() {
    effect((onCleanup) => {
      const query = this.searchQuery().trim();

      if (query.length > 0) {
        this.isSearching.set(true);

        const self = this;
        const timeout = setTimeout(() => {
          self.movieService.searchMovies(query).subscribe({
            next: (response: MovieResponse) => {
              self.searchResults.set(response.results.slice(0, 5));
              self.isSearching.set(false);
            },
            error: () => {
              self.isSearching.set(false);
            }
          });
        }, 300);

        onCleanup(() => clearTimeout(timeout));
      } else {
        this.searchResults.set([]);
        this.isSearching.set(false);
      }
    });
  }

  onSearchInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchQuery.set(inputElement.value);
  }

  closeSearch() {
    this.searchQuery.set('');
    this.searchResults.set([]);
  }
}
