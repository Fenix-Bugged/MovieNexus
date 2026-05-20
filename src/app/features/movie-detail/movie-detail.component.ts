import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TmdbService } from '../../core/services/tmdb.service';
import {
  MovieDetail,
  CastMember,
  Video,
  Movie,
} from '../../core/models/movie.interface';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [MovieCardComponent],
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.css',
})
export class MovieDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tmdb = inject(TmdbService);
  private sanitizer = inject(DomSanitizer);

  movie = signal<MovieDetail | null>(null);
  cast = signal<CastMember[]>([]);
  trailer = signal<Video | null>(null);
  similarMovies = signal<Movie[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = +params['id'];
      if (id) {
        this.loadMovie(id);
      }
    });
  }

  private loadMovie(id: number): void {
    this.isLoading.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.tmdb.getMovieDetail(id).subscribe({
      next: (movie) => {
        this.movie.set(movie);
        this.isLoading.set(false);
      },
    });

    this.tmdb.getMovieCredits(id).subscribe({
      next: (credits) => this.cast.set(credits.cast.slice(0, 12)),
    });

    this.tmdb.getMovieVideos(id).subscribe({
      next: (res) => {
        const trailer = res.results.find(
          (v) => v.type === 'Trailer' && v.site === 'YouTube',
        );
        this.trailer.set(trailer || null);
      },
    });

    this.tmdb.getSimilarMovies(id).subscribe({
      next: (res) => this.similarMovies.set(res.results.slice(0, 6)),
    });
  }

  getBackdropUrl(): string {
    const m = this.movie();
    return m ? this.tmdb.getImageUrl(m.backdrop_path, 'original') : '';
  }

  getPosterUrl(): string {
    const m = this.movie();
    return m ? this.tmdb.getImageUrl(m.poster_path, 'w500') : '';
  }

  getProfileUrl(path: string | null): string {
    return this.tmdb.getImageUrl(path, 'w200');
  }

  getTrailerUrl(): SafeResourceUrl {
    const t = this.trailer();
    if (!t) return '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${t.key}?autoplay=0&rel=0`,
    );
  }

  formatRuntime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}min`;
  }

  formatCurrency(value: number): string {
    if (!value) return 'N/A';
    return '$' + value.toLocaleString('en-US');
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
