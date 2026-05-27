import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoritesService } from '../../core/services/favorites.service';
import { MovieCard } from '../../shared/components/movie-card/movie-card';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, MovieCard, EmptyStateComponent],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css'
})
export class Favorites implements OnInit {
  public favoritesService = inject(FavoritesService);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1000);
  }

  get favoriteMovies() {
    return this.favoritesService.favorites;
  }
}
