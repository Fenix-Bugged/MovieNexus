import { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewTransitions, withComponentInputBinding } from '@angular/router'; // Importación requerida
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { apiInterceptor } from './core/interceptors/api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions(), withComponentInputBinding()), // Activamos las transiciones de vista aquí
    provideClientHydration(),
    provideHttpClient(
      withFetch(),
      withInterceptors([apiInterceptor])
    )
  ]
};
