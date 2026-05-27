import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Functional interceptor that appends the TMDB api_key and language
 * params to every outgoing request targeting the TMDB API.
 */
export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  // Only intercept requests to TMDB
  if (req.url.startsWith(environment.baseUrl)) {
    const clonedReq = req.clone({
      params: req.params
        .set('api_key', environment.apiKey)
        .set('language', 'es-ES'),
    });
    return next(clonedReq);
  }
  return next(req);
};
