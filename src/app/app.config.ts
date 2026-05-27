import { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewTransitions, withComponentInputBinding } from '@angular/router'; // Importación requerida
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withViewTransitions({
        onViewTransitionCreated: ({ transition, from, to }) => {
          // 1. Omitir si es la carga inicial de la aplicación
          if (!from) {
            transition.skipTransition();
            return;
          }

          // Función helper para determinar si un snapshot apunta a detalles de película
          const isMovieDetails = (snapshot: any): boolean => {
            let current = snapshot;
            while (current) {
              if (current.routeConfig?.path === 'movie/:id') {
                return true;
              }
              current = current.firstChild;
            }
            return false;
          };

          // 2. Omitir la transición de ida (Home -> Detalles)
          if (isMovieDetails(to)) {
            transition.skipTransition();
          }
        }
      }),
      withComponentInputBinding()
    ), // Activamos las transiciones de vista aquí
    provideClientHydration(),
    provideHttpClient(
      withFetch(),
      withInterceptors([apiInterceptor, errorInterceptor])
    )
  ]
};
