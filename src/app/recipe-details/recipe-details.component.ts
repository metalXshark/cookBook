import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Recipe } from '../services/recipe.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { RecipeService } from '../services/recipe.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ImageStorageService } from '../services/image-storage.service';

@Component({
  selector: 'app-recipe-details',
  templateUrl: './recipe-details.component.html',
  styleUrls: ['./recipe-details.component.css']
})
export class RecipeDetailsComponent implements OnChanges {
  @Input() recipe: Recipe | null = null;
  @Output() closeEvent = new EventEmitter<void>();
  isVisible = false;
  isAuthor$: Observable<boolean> = new Observable<boolean>();
  recipeImage: string | null = null;

  constructor(
    private dialog: MatDialog,
    private recipeService: RecipeService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private router: Router,
    private imageStorage: ImageStorageService
  ) {}

  ngOnChanges() {
    this.isVisible = !!this.recipe;
    document.body.style.overflow = this.isVisible ? 'hidden' : '';

    if (this.recipe) {
      this.isAuthor$ = this.recipeService.isAuthor(this.recipe);
      if (this.recipe.hasImage && this.recipe.id) {
        this.recipeImage = this.imageStorage.getImage(this.recipe.id);
      }
    }
  }

  close() {
    this.closeEvent.emit();
  }

  editRecipe() {
    if (this.recipe?.id) {
      this.close();
      this.router.navigate(['/edit', this.recipe.id]);
    }
  }

  deleteRecipe() {
    if (this.recipe?.id) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Удаление рецепта',
          message: 'Вы уверены, что хотите удалить этот рецепт?'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && this.recipe?.id) {
          this.recipeService.deleteRecipe(this.recipe.id)
            .then(() => {
              this.snackBar.open('Рецепт успешно удалён', 'Закрыть', { duration: 3000 });
              this.close();
            })
            .catch(error => {
              this.snackBar.open('Ошибка при удалении рецепта', 'Закрыть', { duration: 3000 });
              console.error('Ошибка при удалении рецепта:', error);
            });
        }
      });
    }
  }
}
