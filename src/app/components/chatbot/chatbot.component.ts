import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-chatbot',
  imports: [CommonModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatbotComponent implements OnInit, OnDestroy {  

  constructor(private renderer:Renderer2, public authService:AuthService){}

  ngOnInit(): void {
    this.loadN8nChat();
  }

  ngOnDestroy(): void {
    this.removeN8nChat();
  }

  loadN8nChat() {
    // CSS
    const link = this.renderer.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css';
    this.renderer.appendChild(document.head, link);

    // Script
    const script = this.renderer.createElement('script');
    script.type = 'module';
    script.text = `
      import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
      createChat({
        webhookUrl: 'https://igorsteffen.app.n8n.cloud/webhook/cb71f386-78c1-4334-83b5-eb2914b77b6b/chat',
        i18n: {
        en: {
        title: '',
        subtitle: "",
        }}
      });
    `;
    this.renderer.appendChild(document.body, script);
  }

  removeN8nChat(): void {
    const styleEl = document.querySelector('link[href*="n8n/chat"]');
    if (styleEl) styleEl.remove();

    const chatEl = document.querySelector('.n8n-chat-widget') || document.querySelector('n8n-chat');
    if (chatEl) chatEl.remove();

    const scriptEl = Array.from(document.querySelectorAll('script')).find(el =>
      el.textContent?.includes('createChat')
    );
    if (scriptEl) scriptEl.remove();
  }

}
