import { Component, inject, OnInit, signal, AfterViewInit, ElementRef, ViewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MovieService } from '../../core/services/movie.service';
import { HeroComponent as Hero } from '../../shared/components/hero/hero';
import { MovieSlider } from '../../shared/components/movie-slider/movie-slider';
import { MovieCard } from '../../shared/components/movie-card/movie-card';
import { Movie } from '../../core/models/movie.model';
import { SkeletonHero } from '../../shared/components/skeleton-hero/skeleton-hero';
import { SkeletonCard } from '../../shared/components/skeleton-card/skeleton-card';
import { delay } from 'rxjs';

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

  // Marcamos un elemento del HTML para observarlo de forma segura
  @ViewChild('infiniteAnchor') infiniteAnchor!: ElementRef;

  // Signals para almacenar el estado reactivamente de forma local
  featuredMovie = signal<Movie | null>(null);
  trendingMovies = signal<Movie[]>([]);
  popularMovies = signal<Movie[]>([]);

  // Lógica del Catálogo de Carga Infinita
  catalogMovies = signal<Movie[]>([]);
  currentPage = signal<number>(1);
  isFetchingNextPage = signal<boolean>(false);

  ngOnInit(): void {
    // 1. Pedimos las tendencias del día
    this.movieService.getTrendingMovies().pipe(delay(1000)).subscribe({
      next: (data) => {
        if (data.results.length > 0) {
          this.featuredMovie.set(data.results[0]); // Ponemos la #1 como Destacada
          this.trendingMovies.set(data.results);   // Guardamos la lista completa para el Slider
        }
      }
    });

    // 2. Pedimos las populares (Slider estático inicial)
    this.movieService.getPopularMovies().pipe(delay(1000)).subscribe({
      next: (data) => {
        this.popularMovies.set(data.results);
      }
    });

    // 3. Cargamos la primera página de películas para el Catálogo de Scroll Infinito
    this.loadMoreMovies();
  }

  ngAfterViewInit(): void {
    // Solo configuramos el observador en el navegador (SSR Safety)
    if (isPlatformBrowser(this.platformId)) {
      this.initInfiniteScroll();
    }
  }

  private initInfiniteScroll(): void {
    const observer = new IntersectionObserver((entries) => {
      // Si el ancla entra en el campo de visión y no estamos cargando otra página activa...
      if (entries[0].isIntersecting && !this.isFetchingNextPage()) {
        this.loadMoreMovies();
      }
    }, {
      rootMargin: '200px' // rootMargin permite cargar 200px antes de llegar físicamente al final
    });

    observer.observe(this.infiniteAnchor.nativeElement);
  }

  loadMoreMovies(): void {
    this.isFetchingNextPage.set(true);

    this.movieService.getPopularMovies(this.currentPage()).pipe(delay(1000)).subscribe({
      next: (data) => {
        // Inmutabilidad: Concatenamos los resultados usando el operador spread [...]
        this.catalogMovies.set([...this.catalogMovies(), ...data.results]);
        // Avanzamos de página de forma reactiva
        this.currentPage.update(p => p + 1);
        this.isFetchingNextPage.set(false);
      },
      error: () => {
        this.isFetchingNextPage.set(false);
      }
    });
  }
}
