import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  get currentUser$() {
    return this.afAuth.authState;
  }

  async signUp(email: string, password: string, displayName: string) {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      await userCredential.user?.updateProfile({ displayName });
      this.snackBar.open('Регистрация прошла успешно', 'Закрыть', { duration: 3000 });
      return true;
    } catch (error) {
      this.snackBar.open('Ошибка регистрации: ' + this.getErrorMessage(error), 'Закрыть', { duration: 3000 });
      return false;
    }
  }

  async signIn(email: string, password: string) {
    try {
      await this.afAuth.signInWithEmailAndPassword(email, password);
      this.snackBar.open('Вход выполнен успешно', 'Закрыть', { duration: 3000 });
      return true;
    } catch (error) {
      this.snackBar.open('Ошибка входа: ' + this.getErrorMessage(error), 'Закрыть', { duration: 3000 });
      return false;
    }
  }

  async signOut() {
    await this.afAuth.signOut();
    this.snackBar.open('Вы вышли из системы', 'Закрыть', { duration: 3000 });
    this.router.navigate(['/']);
  }

  private getErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Email уже используется';
      case 'auth/invalid-email':
        return 'Неверный формат email';
      case 'auth/weak-password':
        return 'Пароль должен содержать минимум 6 символов';
      case 'auth/user-not-found':
        return 'Пользователь не найден';
      case 'auth/wrong-password':
        return 'Неверный пароль';
      default:
        return 'Неизвестная ошибка';
    }
  }
}
