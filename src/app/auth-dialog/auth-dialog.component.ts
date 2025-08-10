import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-auth-dialog',
  templateUrl: './auth-dialog.component.html',
  styleUrls: ['./auth-dialog.component.css']
})
export class AuthDialogComponent implements OnInit, OnDestroy {
  isLoginMode = true;
  authForm: FormGroup;
  currentUser: any = null;
  private formSub: Subscription = Subscription.EMPTY;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    public dialogRef: MatDialogRef<AuthDialogComponent>
  ) {
    this.authForm = this.fb.group({
      displayName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.setFormValidation();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.formSub = this.authForm.valueChanges.subscribe();
  }

  ngOnDestroy() {
    this.formSub.unsubscribe();
  }

  private setFormValidation() {
    const displayNameControl = this.authForm.get('displayName');
    if (this.isLoginMode) {
      displayNameControl?.clearValidators();
    } else {
      displayNameControl?.setValidators([Validators.required]);
    }
    displayNameControl?.updateValueAndValidity();
  }

  switchMode() {
    this.isLoginMode = !this.isLoginMode;
    this.setFormValidation();
  }

  async onSubmit() {
    if (this.authForm.invalid) return;

    const { email, password, displayName } = this.authForm.value;

    if (this.isLoginMode) {
      await this.authService.signIn(email, password);
    } else {
      await this.authService.signUp(email, password, displayName);
    }
    this.dialogRef.close();
    // Не закрываем диалог здесь, чтобы пользователь видел результат
  }

  signOut() {
    this.authService.signOut();
    this.dialogRef.close();
  }
}
