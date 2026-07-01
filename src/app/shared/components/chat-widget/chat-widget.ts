import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../../core/services/gemini.service';
import { MovieCard } from '../movie-card/movie-card'; // Importación requerida para las cards de películas

// Declaración para dar soporte de tipos a SpeechRecognition
declare var webkitSpeechRecognition: any;

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, MovieCard],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.css'
})
export class ChatWidget implements AfterViewChecked {
  public geminiService = inject(GeminiService);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isWidgetOpen = signal<boolean>(false);
  userInput = signal<string>('');

  isRecording = signal<boolean>(false);
  private recognition: any = null;
  private speechTimeout: any = null;

  constructor() {
    this.initSpeechRecognition();
  }

  get recognitionAvailable(): boolean {
    return !!this.recognition;
  }

  private initSpeechRecognition(): void {
    // CRÍTICO (SSR Safety): Solo inicializamos la API si estamos en el navegador y es soportada
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'es-ES'; // Dictado en español

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const textResult = finalTranscript || interimTranscript;
        if (textResult.trim()) {
          this.userInput.set(textResult);

          // AUTO-ENVÍO INTELIGENTE: Si el usuario detiene la voz por 600ms, enviamos el mensaje automáticamente
          if (this.speechTimeout) clearTimeout(this.speechTimeout);
          this.speechTimeout = setTimeout(() => {
            this.stopListeningAndSend();
          }, 600);
        }
      };

      this.recognition.onerror = () => {
        this.isRecording.set(false);
      };

      this.recognition.onend = () => {
        this.isRecording.set(false);
      };
    }
  }

  toggleRecording(): void {
    if (!this.recognition) return;

    if (this.isRecording()) {
      this.recognition.stop();
      this.isRecording.set(false);
    } else {
      this.userInput.set(''); // Limpiamos la entrada previa
      this.isRecording.set(true);
      this.recognition.start();
    }
  }

  private stopListeningAndSend(): void {
    if (this.isRecording()) {
      this.recognition.stop();
      this.isRecording.set(false);
    }
    
    // Disparar lógica de envío de mensaje existente
    this.onSendMessage();
  }

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

