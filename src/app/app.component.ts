import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, NavbarComponent, ChatbotComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  auth$: Observable<boolean>;
  
  constructor(private authService : AuthService){
    this.auth$ = this.authService.auth$;
  }
  
  title = 'taskfy-app';
}
