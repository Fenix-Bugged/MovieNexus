import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Movie } from '../models/movie.model';

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  recommendedMovies?: Movie[]; // Almacenará los posters y metadatos reales de TMDB
}

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private http = inject(HttpClient);
  
  // Signals como única fuente de la verdad para el estado de la conversación
  public chatHistory = signal<ChatMessage[]>([]);
  public isWaitingResponse = signal<boolean>(false);

  /**
   * Envía un mensaje a nuestro proxy backend en Vercel, y con las películas recomendadas,
   * consulta en paralelo a la API de TMDB para obtener el poster y detalles de cada una.
   */
  sendMessage(userMessage: string): void {
    // Añadir mensaje del usuario inmediatamente al historial
    const currentHistory = this.chatHistory();
    this.chatHistory.set([...currentHistory, { sender: 'user', text: userMessage }]);
    this.isWaitingResponse.set(true);

    // Mandamos el mensaje y el historial para mantener la memoria del chat
    const payload = {
      message: userMessage,
      history: currentHistory.map(m => ({ sender: m.sender, text: m.text }))
    };

    this.http.post<{ response: string; recommendations: string[] }>('/api/chat', payload)
      .pipe(
        // Convertimos los títulos recomendados en llamadas paralelas de búsqueda a TMDB
        switchMap(apiRes => {
          if (apiRes.recommendations && apiRes.recommendations.length > 0) {
            const tmdbCalls = apiRes.recommendations.map(title => this.searchMovieOnTMDB(title));
            return forkJoin(tmdbCalls).pipe(
              map(movies => ({
                text: apiRes.response,
                recommendedMovies: movies.filter((m): m is Movie => m !== null)
              }))
            );
          } else {
            return of({ text: apiRes.response, recommendedMovies: [] });
          }
        }),
        catchError(err => {
          console.error('Error en el pipeline del Chat AI:', err);
          return of({
            text: '¡Vaya! Parece que se cortó la proyección en nuestra cabina. ¿Podrías intentar enviarme tu pregunta de nuevo? 🍿🎬',
            recommendedMovies: []
          });
        })
      )
      .subscribe(aiRes => {
        // Guardamos la respuesta de la IA y sus cards recomendadas
        this.chatHistory.set([
          ...this.chatHistory(),
          { sender: 'ai', text: aiRes.text, recommendedMovies: aiRes.recommendedMovies }
        ]);
        this.isWaitingResponse.set(false);
      });
  }

  /**
   * Consulta directa al endpoint de búsqueda de TMDB.
   * Nota: Nuestro apiInterceptor ya adjunta automáticamente la api_key y el idioma.
   */
  private searchMovieOnTMDB(title: string): Observable<Movie | null> {
    return this.http.get<{ results: Movie[] }>(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}`)
      .pipe(
        map(res => res.results && res.results.length > 0 ? res.results[0] : null),
        catchError(() => of(null))
      );
  }

  /**
   * Limpia la memoria del chat actual
   */
  clearHistory(): void {
    this.chatHistory.set([]);
  }
}
