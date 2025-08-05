import { Routes } from '@angular/router';
import { RecipeListComponent } from './recipe-list/recipe-list.component';

export const appRoutes: Routes = [
  { path: '', component: RecipeListComponent },
  // Добавим другие маршруты позже, например для создания или редактирования рецептов
];
