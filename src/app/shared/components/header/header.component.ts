import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovieService } from '../../../../core/services/movie.service';
import { Movie } from '../../../../core/models/movie.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private movieService = inject(MovieService);

  // Signals para manejar el estado del buscador
  searchQuery = signal<string>('');
  searchResults = signal<Movie[]>([]);
  isSearching = signal<boolean>(false);

  constructor() {
    // Un effect que vigila automáticamente la Signal searchQuery
    effect((onCleanup) => {
      const query = this.searchQuery().trim();

      if (query.length > 0) {
        this.isSearching.set(true);

        // Patrón Debounce: Espera 300ms antes de realizar la petición HTTP
        const timeout = setTimeout(() => {
          this.movieService.searchMovies(query).subscribe({
            next: (response) => {
              // Limitamos a los primeros 5 resultados
              this.searchResults.set(response.results.slice(0, 5));
              this.isSearching.set(false);
            },
            error: () => {
              this.isSearching.set(false);
            }
          });
        }, 300);

        // Si la señal cambia antes de que terminen los 300ms, cancela el timer anterior
        onCleanup(() => {
          clearTimeout(timeout);
        });
      } else {
        // Si el buscador queda vacío, limpiamos los estados
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
