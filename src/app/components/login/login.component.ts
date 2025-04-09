import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm:FormGroup;
  loginError: string | null = null;

  constructor(private fb:FormBuilder, private router: Router, private authService:AuthService){
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    })
  }

  login(){
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const {email, password} = this.loginForm.value;
    this.loginError = null;
    this.authService.login(email, password).subscribe({
      next: (response) => {
        sessionStorage.setItem('token', response.token);
        this.router.navigate(['/projects']);
      },
      error: (err) => {
        if (err.status === 401 && err.error?.error) {
          this.loginError = err.error.error;
        } else {
          this.loginError = 'Unexpected Error. Try again.';
        }
      }
    });
  }
  
  goToSignup() {
    this.router.navigate(['/signup']);    
  }

}
