import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RecipeService } from '../services/recipe.service';
import { AuthService } from '../services/auth.service';
import { ImageStorageService } from '../services/image-storage.service';

@Component({
  selector: 'app-recipe-form',
  templateUrl: './recipe-form.component.html',
  styleUrls: ['./recipe-form.component.css']
})
export class RecipeFormComponent implements OnInit {
  recipeForm: FormGroup;
  units = ['г', 'кг', 'мл', 'л', 'шт', 'ч.л.', 'ст.л.', 'по вкусу'];
  isEditMode = false;
  recipeId: string | null = null;
  isAuthor = false;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  hasImage = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private recipeService: RecipeService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private authService: AuthService,
    private imageStorage: ImageStorageService
  ) {
    this.recipeForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      ingredients: this.fb.array([this.createIngredient()])
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.recipeId = params['id'];
        if (this.recipeId) {
          this.loadRecipe(this.recipeId);
        }
      }
    });
  }

  loadRecipe(id: string): void {
    this.recipeService.getRecipeById(id).subscribe(recipe => {
      if (recipe) {
        this.hasImage = recipe.hasImage || false;
        this.recipeForm.patchValue({
          title: recipe.title,
          description: recipe.description
        });

        while (this.ingredients.length) {
          this.ingredients.removeAt(0);
        }

        recipe.ingredients.forEach(ingredient => {
          this.ingredients.push(this.fb.group({
            name: [ingredient.name, Validators.required],
            amount: [ingredient.amount, [Validators.required, Validators.min(0.1)]],
            unit: [ingredient.unit, Validators.required]
          }));
        });

        this.recipeService.isAuthor(recipe).subscribe(isAuthor => {
          this.isAuthor = isAuthor;
          if (!isAuthor && this.isEditMode) {
            this.snackBar.open('Только автор может редактировать этот рецепт', 'Закрыть', { duration: 3000 });
            this.router.navigate(['/']);
          }
        });
      }
    });
  }

  getImage(): string | null {
    if (this.previewUrl) return this.previewUrl as string;
    if (this.recipeId && this.hasImage) return this.imageStorage.getImage(this.recipeId);
    return null;
  }

  // Остальные методы остаются без изменений
  createIngredient(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.1)]],
      unit: ['', Validators.required]
    });
  }

  get ingredients(): FormArray {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  addIngredient(): void {
    this.ingredients.push(this.createIngredient());
  }

  removeIngredient(index: number): void {
    this.ingredients.removeAt(index);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.hasImage = true;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.hasImage = false;
    // Очищаем поле ввода файла
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async onSubmit(): Promise<void> {
    if (this.recipeForm.valid) {
      try {
        const formValue = this.recipeForm.value;
        const recipeData = {
          title: formValue.title,
          description: formValue.description,
          ingredients: formValue.ingredients
        };

        if (this.isEditMode && this.recipeId) {
          await this.recipeService.updateRecipeWithImage(
            this.recipeId,
            recipeData,
            this.selectedFile || undefined
          );
          this.snackBar.open('Рецепт успешно обновлён', 'Закрыть', { duration: 3000 });
          this.router.navigate(['/']);
        } else {
          await this.recipeService.saveRecipeWithImage(
            recipeData,
            this.selectedFile || undefined
          );
          this.snackBar.open('Рецепт успешно сохранён', 'Закрыть', { duration: 3000 });
          this.router.navigate(['/']);
        }
      } catch (error) {
        this.snackBar.open('Ошибка: ' + (error as Error).message, 'Закрыть', { duration: 3000 });
      }
    }
  }
}
