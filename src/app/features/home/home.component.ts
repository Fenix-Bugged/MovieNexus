import { Component, inject, OnInit } from '@angular/core';
import { MovieService } from '../../core/services/movie.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private movieService = inject(MovieService);

  ngOnInit(): void {
    this.movieService.getTrendingMovies().subscribe({
      next: (response) => {
        console.log('Datos recibidos de TMDB:', response);
      },
      error: (error) => {
        console.error('Error al recibir datos:', error);
      }
    });
  }
}
