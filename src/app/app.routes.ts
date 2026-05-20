import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'movie/:id', // :id es el parámetro dinámico
    loadComponent: () => import('./features/movie-details/movie-details').then(m => m.MovieDetails)
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
    path: 'favorites',
    loadComponent: () => import('./features/favorites/favorites').then(m => m.Favorites)
  },
  {
    path: '**',
    redirectTo: '',
  },
];
