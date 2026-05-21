import { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewTransitions, withComponentInputBinding } from '@angular/router'; // Importación requerida
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { apiInterceptor } from './core/interceptors/api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withViewTransitions({
        onViewTransitionCreated: ({ transition, from }) => {
          // Si no hay una ruta previa (from es undefined), estamos en la carga inicial de la aplicación
          // por lo que cancelamos la transición para que se cargue al instante sin animación lenta.
          if (!from) {
            transition.skipTransition();
          }
        }
      }),
      withComponentInputBinding()
    ), // Activamos las transiciones de vista aquí
    provideClientHydration(),
    provideHttpClient(
      withFetch(),
      withInterceptors([apiInterceptor])
    )
  ]
};
