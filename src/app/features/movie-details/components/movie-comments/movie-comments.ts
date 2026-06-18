import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../../../core/services/comment.service';
import { Comment } from '../../../../core/models/comment.model';

@Component({
  selector: 'app-movie-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movie-comments.html',
  styleUrl: './movie-comments.css',
  // OnPush: Angular solo renderiza cuando detectamos cambios manualmente,
  // lo que elimina renders innecesarios dentro del bloque @defer.
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieComments implements OnInit {
  private commentService = inject(CommentService);

  // Forzamos la detección de cambios manualmente tras cada operación asíncrona
  private cdr = inject(ChangeDetectorRef);

  @Input() movieId!: number; // Recibe el ID de la película desde la vista de detalles

  comments: Comment[] = [];
  loading = false;
  error = '';
  submitting = false;

  // Campos vinculados al formulario reactivo por plantilla
  authorName = '';
  commentText = '';
  selectedRating = 5;
  showForm = false;
  successMessage = '';

  get itemId(): string {
    return `movie-${this.movieId}`;
  }

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.loading = true;
    this.error = '';
    // Notificamos que loading cambió a true antes de la petición
    this.cdr.detectChanges();

    this.commentService.getComments(this.itemId).subscribe({
      next: (data) => {
        // Ordenamos los comentarios de más recientes a más antiguos
        this.comments = data.sort(
          (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );
        this.loading = false;
        // Forzamos render: el @defer puede estar fuera del ciclo de CD principal
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar los comentarios. Asegúrate de que la API está activa.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.successMessage = '';
    // Garantiza que el formulario aparece/desaparece de inmediato
    this.cdr.detectChanges();
  }

  setRating(value: number): void {
    this.selectedRating = value;
    // Fuerza actualización visual de las estrellas seleccionadas
    this.cdr.detectChanges();
  }

  submitComment(): void {
    if (!this.authorName.trim() || !this.commentText.trim()) return;
    this.submitting = true;
    this.cdr.detectChanges();

    this.commentService.addComment(
      this.itemId,
      this.authorName.trim(),
      this.commentText.trim(),
      this.selectedRating
    ).subscribe({
      next: (newComment) => {
        // Añadimos el nuevo comentario al inicio de la lista de manera reactiva
        this.comments = [newComment, ...this.comments];

        // Reset del formulario
        this.authorName = '';
        this.commentText = '';
        this.selectedRating = 5;
        this.showForm = false;
        this.submitting = false;

        this.successMessage = 'Comentario publicado exitosamente!';
        // Render inmediato tras publicar
        this.cdr.detectChanges();

        setTimeout(() => {
          this.successMessage = '';
          // Limpiamos el banner tras el timeout
          this.cdr.detectChanges();
        }, 3000);
      },
      error: () => {
        this.submitting = false;
        this.error = 'Error al publicar. Reintenta de nuevo.';
        this.cdr.detectChanges();
      }
    });
  }
}
