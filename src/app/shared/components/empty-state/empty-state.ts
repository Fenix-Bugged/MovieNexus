import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [RouterLink], // Requerido para el botón de acción condicional
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css'
})
export class EmptyStateComponent {
  icon = input<string>('🎬'); // Ícono emoji por defecto
  title = input<string>('No hay resultados');
  message = input<string>('Intenta realizar otra búsqueda.');
  
  // Parámetros opcionales para un botón de redirección (Call To Action)
  actionText = input<string>();
  actionLink = input<string>();
}
