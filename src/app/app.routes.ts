// app.routes.ts
import { Routes } from '@angular/router';
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { RecipeFormComponent } from './recipe-form/recipe-form.component';

export const appRoutes: Routes = [
  { path: '', component: RecipeListComponent },
  { path: 'new', component: RecipeFormComponent },
  { path: 'edit/:id', component: RecipeFormComponent },
  { path: '**', redirectTo: '' }
];
