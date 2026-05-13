import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('api.themoviedb.org')) {
    const cloneReq = req.clone({
      setParams: {
        api_key: environment.apiKey,
        language: 'es-ES'
      }
    });
    return next(cloneReq);
  }
  return next(req);
};
