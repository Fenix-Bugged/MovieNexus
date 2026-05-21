import { Component, inject, OnInit, AfterViewInit, ElementRef, ViewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MovieService } from '../../core/services/movie.service';
import { HeroComponent as Hero } from '../../shared/components/hero/hero';
import { MovieSlider } from '../../shared/components/movie-slider/movie-slider';
import { MovieCard } from '../../shared/components/movie-card/movie-card';
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
  // Las signals viven en el servicio (singleton) para persistir entre navegaciones
  movieService = inject(MovieService);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('infiniteAnchor') infiniteAnchor!: ElementRef;

  // Accesos directos a las signals del servicio (para usarlos en el template)
  trendingMovies    = this.movieService.trendingMovies;
  popularMovies     = this.movieService.popularMovies;
  catalogMovies     = this.movieService.catalogMovies;
  isFetchingNextPage = this.movieService.isFetchingNextPage;

  ngOnInit(): void {
    // Solo pedimos datos si el caché del servicio está vacío.
    // Si el usuario vuelve atrás, los datos ya están cargados → sin skeleton.

    if (this.trendingMovies().length === 0) {
      // 1. Pedimos las tendencias del día (con delay para apreciar el skeleton)
      this.movieService.getTrendingMovies().pipe(delay(1000)).subscribe({
        next: (data) => {
          if (data.results.length > 0) {
            this.movieService.trendingMovies.set(data.results);
          }
        }
      });
    }

    if (this.popularMovies().length === 0) {
      // 2. Pedimos las populares (Slider estático inicial)
      this.movieService.getPopularMovies().pipe(delay(1000)).subscribe({
        next: (data) => {
          this.movieService.popularMovies.set(data.results);
        }
      });
    }

    if (this.catalogMovies().length === 0) {
      // 3. Cargamos la primera página del catálogo de Scroll Infinito
      this.loadMoreMovies();
    }
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
    this.movieService.isFetchingNextPage.set(true);

    this.movieService.getPopularMovies(this.movieService.currentPage()).pipe(delay(1000)).subscribe({
      next: (data) => {
        // Inmutabilidad: concatenamos los resultados usando el operador spread [...]
        this.movieService.catalogMovies.set([...this.catalogMovies(), ...data.results]);
        // Avanzamos de página de forma reactiva
        this.movieService.currentPage.update(p => p + 1);
        this.movieService.isFetchingNextPage.set(false);
      },
      error: () => {
        this.movieService.isFetchingNextPage.set(false);
      }
    });
  }
}
