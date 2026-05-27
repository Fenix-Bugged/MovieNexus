import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Movie } from '../../../core/models/movie.model';
import { FavoritesService } from '../../../core/services/favorites.service';
import { MovieService } from '../../../core/services/movie.service';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.css'
})
export class MovieCard {
  @Input({ required: true }) movie!: Movie;
  @Input() context: string = 'default'; // Identifica de qué lista proviene (trending, popular, catalog)
  private favoritesService = inject(FavoritesService);
  private movieService = inject(MovieService);

  get posterUrl() {
    return this.movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${this.movie.poster_path}`
      : 'assets/no-poster.png';
  }

  // Solo la tarjeta activa (mismo ID + mismo contexto) recibe el view-transition-name
  get transitionName(): string | null {
    const active = this.movieService.activeTransitionMovieId();
    const activeCtx = this.movieService.activeTransitionContext();
    return (active === this.movie.id && activeCtx === this.context)
      ? 'movie-poster-' + this.movie.id
      : null;
  }

  get isFavorite(): boolean {
    return this.favoritesService.isFavorite(this.movie.id);
  }

  onCardClick(): void {
    this.movieService.activeTransitionMovieId.set(this.movie.id);
    this.movieService.activeTransitionContext.set(this.context);
  }

  toggleFavorite(event: Event) {
    event.preventDefault(); // Evita navegar al detalle al dar click al corazón
    event.stopPropagation(); // Evita que el evento se propague al contenedor
    this.favoritesService.toggleFavorite(this.movie);
  }
}
