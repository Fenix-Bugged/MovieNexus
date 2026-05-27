import { Component, inject, OnInit, signal, AfterViewInit, ElementRef, ViewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MovieService } from '../../core/services/movie.service';
import { HeroComponent as Hero } from '../../shared/components/hero/hero';
import { MovieSlider } from '../../shared/components/movie-slider/movie-slider';
import { MovieCard } from '../../shared/components/movie-card/movie-card';
import { SkeletonHero } from '../../shared/components/skeleton-hero/skeleton-hero';
import { SkeletonCard } from '../../shared/components/skeleton-card/skeleton-card';
import { Movie } from '../../core/models/movie.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Hero, MovieSlider, MovieCard, SkeletonHero, SkeletonCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, AfterViewInit {
  private movieService = inject(MovieService);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('infiniteAnchor') infiniteAnchor!: ElementRef;

  // Vinculamos directamente las propiedades del componente a la caché del servicio
  featuredMovie = signal<Movie | null>(null);
  
  // Usamos getters o asignación de referencia para usar la caché compartida
  get trendingMovies() { return this.movieService.trendingMoviesCache; }
  get popularMovies() { return this.movieService.popularMoviesCache; }
  get catalogMovies() { return this.movieService.catalogMoviesCache; }
  get currentPage() { return this.movieService.currentPageCache; }
  
  isFetchingNextPage = signal<boolean>(false);

  ngOnInit(): void {
    // Si la caché está vacía, realizamos las peticiones iniciales
    if (this.trendingMovies().length === 0) {
      this.movieService.getTrendingMovies().subscribe({
        next: (data) => {
          if (data.results.length > 0) {
            this.featuredMovie.set(data.results[0]);
            this.movieService.trendingMoviesCache.set(data.results);
          }
        }
      });
    } else {
      // Si ya hay datos en caché, asignamos la película destacada inmediatamente para evitar parpadeos
      this.featuredMovie.set(this.trendingMovies()[0]);
    }

    if (this.popularMovies().length === 0) {
      this.movieService.getPopularMovies().subscribe({
        next: (data) => {
          this.movieService.popularMoviesCache.set(data.results);
        }
      });
    }

    if (this.catalogMovies().length === 0) {
      this.loadMoreMovies();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initInfiniteScroll();
    }
  }

  private initInfiniteScroll(): void {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !this.isFetchingNextPage()) {
        this.loadMoreMovies();
      }
    }, {
      rootMargin: '200px'
    });

    observer.observe(this.infiniteAnchor.nativeElement);
  }

  loadMoreMovies(): void {
    this.isFetchingNextPage.set(true);

    this.movieService.getPopularMovies(this.currentPage()).subscribe({
      next: (data) => {
        // Concatenamos en la caché del servicio
        this.movieService.catalogMoviesCache.set([...this.catalogMovies(), ...data.results]);
        this.movieService.currentPageCache.update(p => p + 1);
        this.isFetchingNextPage.set(false);
      },
      error: () => {
        this.isFetchingNextPage.set(false);
      }
    });
  }
}
