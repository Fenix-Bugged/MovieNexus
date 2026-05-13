import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'movie/:id',
    loadComponent: () =>
      import('./features/movie-detail/movie-detail.component').then(
        (m) => m.MovieDetailComponent,
      ),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/search/search.component').then(
        (m) => m.SearchComponent,
      ),
  },
  {
    path: 'popular',
    loadComponent: () =>
      import('./features/popular/popular.component').then(
        (m) => m.PopularComponent,
      ),
  },
  {
    path: 'top-rated',
    loadComponent: () =>
      import('./features/top-rated/top-rated.component').then(
        (m) => m.TopRatedComponent,
      ),
  },
  {
    path: 'upcoming',
    loadComponent: () =>
      import('./features/upcoming/upcoming.component').then(
        (m) => m.UpcomingComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
