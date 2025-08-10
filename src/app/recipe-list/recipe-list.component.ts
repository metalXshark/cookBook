import { Component } from '@angular/core';
import { RecipeService, Recipe } from '../services/recipe.service';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthDialogComponent } from '../auth-dialog/auth-dialog.component';
import { ImageStorageService } from '../services/image-storage.service';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent {
  recipes$: Observable<Recipe[]> = of([]);
  selectedRecipe: Recipe | null = null;

  constructor(
    private recipeService: RecipeService,
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private imageStorage: ImageStorageService
  ) {
    this.loadRecipes();
  }

  getRecipeImage(recipeId: string): string | null {
    return this.imageStorage.getImage(recipeId);
  }

  loadRecipes() {
    this.recipes$ = this.recipeService.getRecipes();
  }

  isAuthor(recipe: Recipe): Observable<boolean> {
    return this.recipeService.isAuthor(recipe);
  }

  openAuthDialog() {
    this.dialog.open(AuthDialogComponent, {
      width: '400px'
    });
  }

  createNewRecipe() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.router.navigate(['/new']);
      } else {
        this.snackBar.open('Для создания рецепта необходимо войти в систему', 'Закрыть', { duration: 3000 });
        this.openAuthDialog();
      }
    });
  }

  editRecipe(id: string, event: Event) {
    event.stopPropagation();
    if (!id) return;

    this.recipeService.getRecipeById(id).subscribe(recipe => {
      if (!recipe) return;

      this.authService.currentUser$.subscribe(user => {
        if (user?.uid === recipe.authorId) {
          this.router.navigate(['/edit', id]);
        } else {
          this.snackBar.open('Вы можете редактировать только свои рецепты', 'Закрыть', { duration: 3000 });
        }
      });
    });
  }

  deleteRecipe(id: string, event: Event) {
    event.stopPropagation();
    if (!id) return;

    const confirm = window.confirm('Вы уверены, что хотите удалить этот рецепт?');
    if (!confirm) return;

    this.recipeService.getRecipeById(id).subscribe(recipe => {
      if (!recipe) return;

      this.authService.currentUser$.subscribe(user => {
        if (user?.uid === recipe.authorId) {
          this.recipeService.deleteRecipe(id)
            .then(() => {
              this.snackBar.open('Рецепт успешно удален', 'Закрыть', { duration: 3000 });
              this.loadRecipes();
            })
            .catch(error => {
              this.snackBar.open('Ошибка при удалении рецепта', 'Закрыть', { duration: 3000 });
              console.error(error);
            });
        } else {
          this.snackBar.open('Вы можете удалять только свои рецепты', 'Закрыть', { duration: 3000 });
        }
      });
    });
  }

  openRecipeDetails(recipe: Recipe) {
    this.selectedRecipe = recipe;
  }

  closeRecipeDetails() {
    this.selectedRecipe = null;
  }
}
