import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MovieService } from '../../core/services/movie.service';
import { Movie, CountryProviders, WatchProvidersResponse } from '../../core/models/movie.model';
import { CreditsResponse } from '../../core/models/cast.model';
import { CastCard } from '../../shared/components/cast-card/cast-card.component';
import { MovieTrailer } from './components/movie-trailer/movie-trailer';
import { MovieComments } from './components/movie-comments/movie-comments';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, CastCard, MovieTrailer, MovieComments, RouterLink],
  templateUrl: './movie-details.html',
  styleUrl: './movie-details.css'
})
export class MovieDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);
  private platformId = inject(PLATFORM_ID);

  movieData$ = signal<{
    details: Movie;
    credits: CreditsResponse;
    providers: WatchProvidersResponse | null;
  } | null>(null);
  // Almacena solo los proveedores correspondientes al país del usuario
  localProviders = signal<CountryProviders | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    // Registramos el ID activo para la transición de retorno al Home
    this.movieService.activeTransitionMovieId.set(id);

    // Ejecutamos consultas en paralelo
    forkJoin({
      details: this.movieService.getMovieById(id),
      credits: this.movieService.getMovieCredits(id),
      providers: this.movieService.getWatchProviders(id).pipe(catchError(() => of(null)))
    }).subscribe({
      next: (res) => {
        this.movieData$.set(res);
        
        // Detectamos el país del usuario de forma segura
        if (isPlatformBrowser(this.platformId) && res.providers) {
          // navigator.language suele ser "es-CO" o "es-ES". Extraemos el código del país ("CO" o "ES")
          const userLocale = navigator.language || 'en-US';
          const countryCode = userLocale.split('-')[1]?.toUpperCase() || 'US';
          
          const countryData = res.providers.results[countryCode];
          // Si no hay datos para su país, podemos intentar usar "US" como fallback
          this.localProviders.set(countryData || res.providers.results['US'] || null);
        }
      }
    });
  }

  getBackdropUrl(path: string | null | undefined): string {
    return path ? `https://image.tmdb.org/t/p/original${path}` : '';
  }
}

