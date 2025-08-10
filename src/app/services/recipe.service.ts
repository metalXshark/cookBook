import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ImageStorageService } from './image-storage.service';

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  id?: string;
  title: string;
  date: Date;
  description: string;
  ingredients: Ingredient[];
  authorId: string;
  authorName: string;
  hasImage?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  constructor(
    private firestore: AngularFirestore,
    private snackBar: MatSnackBar,
    private afAuth: AngularFireAuth,
    private imageStorage: ImageStorageService
  ) {}

  // Получаем все рецепты (доступно всем)
  getRecipes(): Observable<Recipe[]> {
    return this.firestore.collection<Recipe>('recipes', ref =>
      ref.orderBy('date', 'desc')
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return {
          ...data,
          id,
          date: data.date instanceof Date ? data.date : data.date.toDate()
        };
      }))
    );
  }

  // Добавляем рецепт (только для авторизованных)
  addRecipe(recipeData: Omit<Recipe, 'id'|'date'|'authorId'|'authorName'>): Observable<void> {
    return new Observable(subscriber => {
      this.afAuth.currentUser.then(user => {
        if (!user) {
          subscriber.error('Для добавления рецепта необходимо войти в систему');
          return;
        }

        const recipe: Omit<Recipe, 'id'> = {
          ...recipeData,
          date: new Date(),
          authorId: user.uid,
          authorName: user.displayName || 'Аноним'
        };

        this.firestore.collection('recipes').add(recipe)
          .then(() => subscriber.next())
          .catch(err => subscriber.error(err))
          .finally(() => subscriber.complete());
      });
    });
  }

  getRecipeById(id: string): Observable<Recipe | undefined> {
    return this.firestore.collection('recipes').doc<Recipe>(id).get().pipe(
      map(doc => {
        if (doc.exists) {
          const data = doc.data() as any;
          return {
            ...data,
            id: doc.id,
            date: data.date instanceof Date ? data.date : data.date.toDate()
          };
        }
        return undefined;
      })
    );
  }

  // Обновление рецепта (только для автора)
  updateRecipe(id: string, recipeData: Partial<Recipe>): Promise<void> {
    return this.afAuth.currentUser.then(user => {
      if (!user) {
        throw new Error('Для редактирования необходимо войти в систему');
      }
      return this.firestore.collection('recipes').doc(id).update({
        ...recipeData,
        date: recipeData.date || new Date()
      });
    });
  }

  // Удаление рецепта (только для автора)
  deleteRecipe(id: string): Promise<void> {
    return this.firestore.collection('recipes').doc(id).delete();
  }

  // Проверка, является ли пользователь автором рецепта
  isAuthor(recipe: Recipe): Observable<boolean> {
    return this.afAuth.authState.pipe(
      map(user => !!user && user.uid === recipe.authorId)
    );
  }

  async saveRecipeWithImage(recipeData: Omit<Recipe, 'id'|'date'|'authorId'|'authorName'>, imageFile?: File): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (!user) {
      throw new Error('Для сохранения рецепта необходимо войти в систему');
    }

    const recipe: Omit<Recipe, 'id'> = {
      ...recipeData,
      date: new Date(),
      authorId: user.uid,
      authorName: user.displayName || 'Аноним',
      hasImage: !!imageFile
    };

    const docRef = await this.firestore.collection('recipes').add(recipe);

    if (imageFile) {
      await this.imageStorage.saveImage(docRef.id, imageFile);
    }
  }

  async updateRecipeWithImage(id: string, recipeData: Partial<Recipe>, imageFile?: File): Promise<void> {
    const updateData: Partial<Recipe> = {
      ...recipeData,
      hasImage: recipeData.hasImage || !!imageFile
    };

    await this.firestore.collection('recipes').doc(id).update(updateData);

    if (imageFile) {
      await this.imageStorage.saveImage(id, imageFile);
    }
  }
}

