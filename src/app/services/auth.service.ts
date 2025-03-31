import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import {jwtDecode} from 'jwt-decode';

// Interface para o payload do token
interface JwtPayload {
  sub?: string;
  id?: string;
  nameid?: string;
  // outros campos se necessário
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) { 
    const token = this.getToken();
    this.authSubject.next(!!token);
  }

  private apiUrl = "https://localhost:7171/api/Users";
  private authSubject = new BehaviorSubject<boolean>(false);
  auth$ = this.authSubject.asObservable();

  

  signup(name : string, lastname : string, email : string, password : string){
    return this.http.post<void>(`${this.apiUrl}/signup`, {name, lastname, email, password}).subscribe({
      next: () => {
        console.log("User created!");
        this.authSubject.next(false)
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error("Erro:", err);
      }
    });
  }

  login(email : string, password : string){
    return this.http.post<{token : string}>(`${this.apiUrl}/login`, {email, password}).subscribe(response => {
      sessionStorage.setItem('token', response.token)
      this.authSubject.next(true)
      this.router.navigate(['/projects']);
    });
  }

  logout(){
    sessionStorage.removeItem('token');
    this.authSubject.next(false)
    this.router.navigate(['/login'])
  }

  getToken(){
    return sessionStorage.getItem('token');
  }

  isAuthenticated(){
    return !!this.getToken();
  }

  getUserId(): string {
    const token = this.getToken();
    if (!token) return '';

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.sub || decoded.id || decoded.nameid || '';
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return '';
    }
  }
}
