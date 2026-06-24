import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/layout/header';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ChatWidget } from './shared/components/chat-widget/chat-widget';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ChatWidget],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class App {}

