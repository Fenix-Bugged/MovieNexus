import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../core/services/movie.service';
import { Movie } from '../../core/models/movie.model';
import { HeroComponent } from '../../shared/components/hero/hero';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private movieService = inject(MovieService);
  movieHero: Movie | null = null;

  ngOnInit(): void {
    this.movieService.getTrendingMovies().subscribe({
      next: (response) => {
        if (response.results && response.results.length > 0) {
          this.movieHero = response.results[0];
        }
      },
      error: (error) => {
        console.error('Error al recibir datos:', error);
      }
    });
  }
}
