import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ForgetPasswordModalComponent } from './forget-password-modal.component';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule, ForgetPasswordModalComponent],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {
  credentials = {
    email: '',
    password: ''
  };
  
  showPassword = false;
  rememberMe = false;
  isLoading = false;
  errorMessage: string = '';
  showForgetPasswordModal: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Try login endpoint first, fallback to signIn if needed
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.token) {
          // Store remember me preference
          if (this.rememberMe) {
            // You can add additional logic here if needed
          }
          // Redirect to dashboard after login
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        // If login fails, try signIn endpoint
        this.trySignIn();
      }
    });
  }

  private trySignIn() {
    this.authService.signIn(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.token) {
          if (this.rememberMe) {
            // Additional logic for remember me
          }
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        // Handle error
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password';
        } else if (error.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check your connection.';
        } else {
          this.errorMessage = error.error?.message || 'An error occurred. Please try again.';
        }
        console.error('Login error:', error);
      }
    });
  }

  openForgetPasswordModal() {
    this.showForgetPasswordModal = true;
  }

  closeForgetPasswordModal() {
    this.showForgetPasswordModal = false;
  }

  onPasswordResetSuccess() {
    this.closeForgetPasswordModal();
    // Optionally show a success message or redirect
  }
}