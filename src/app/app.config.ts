import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter, withViewTransitions, withComponentInputBinding } from '@angular/router'; // Importación requerida
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withViewTransitions({
        onViewTransitionCreated: ({ transition, from, to }) => {
          // 1. Omitir la carga inicial de la aplicación
          if (!from) {
            transition.skipTransition();
            return;
          }

          // Helper para detectar si un snapshot apunta a detalles de película
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

          // SOLO permitir la transición al SALIR de detalles (botón Volver)
          // Omitir en TODAS las demás navegaciones
          if (!isMovieDetails(from)) {
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
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
