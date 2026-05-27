import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado.';

      // Analizamos si es un error de red (lado cliente) o de respuesta del servidor (APIs)
      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error de red: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 401:
            errorMessage = 'No autorizado. Verifica tu API Key de TMDB.';
            break;
          case 404:
            errorMessage = 'El recurso solicitado no ha sido encontrado en el servidor.';
            break;
          case 500:
            errorMessage = 'Error interno en el servidor de películas.';
            break;
        }
      }

      console.error('Error Interceptado:', errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
};
