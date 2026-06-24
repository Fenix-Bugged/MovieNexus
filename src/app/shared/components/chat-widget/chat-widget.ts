import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../../core/services/gemini.service';
import { MovieCard } from '../movie-card/movie-card'; // Importación requerida para las cards de películas

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, MovieCard],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.css'
})
export class ChatWidget implements AfterViewChecked {
  public geminiService = inject(GeminiService);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isWidgetOpen = signal<boolean>(false);
  userInput = signal<string>('');

  toggleWidget(): void {
    this.isWidgetOpen.update(v => !v);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      try {
        const element = this.scrollContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      } catch (err) {}
    }
  }

  onSendMessage(): void {
    const text = this.userInput().trim();
    if (!text) return;

    this.geminiService.sendMessage(text);
    this.userInput.set(''); // Limpiar input reactivo
  }

  sendPresetMessage(text: string): void {
    this.geminiService.sendMessage(text);
  }

  clearChat(): void {
    this.geminiService.clearHistory();
  }
}
