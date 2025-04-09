import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  signupForm:FormGroup;
  signupError: string | null = null;

  constructor(private fb:FormBuilder, private authService:AuthService, private router:Router){
    this.signupForm = this.fb.group({
      name: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    })
  } 

  signup(){
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const {name, lastname, email, password} = this.signupForm.value;
    this.signupError = null;

    this.authService.signup({ name, lastname, email, password }).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        if (err.status === 400 && err.error?.error) {
          this.signupError = err.error.error;
        } else {
          this.signupError = 'Unexpected Error. Try again.';
        }
      }
    });
  }

}
