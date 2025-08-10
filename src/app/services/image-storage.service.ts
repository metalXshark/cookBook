import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageStorageService {
  private readonly STORAGE_KEY = 'recipe_images';

  constructor() {}

  saveImage(recipeId: string, file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        this.saveToStorage(recipeId, imageData);
        resolve(imageData);
      };
      reader.readAsDataURL(file);
    });
  }

  getImage(recipeId: string): string | null {
    const images = this.getAllImages();
    return images[recipeId] || null;
  }

  deleteImage(recipeId: string): void {
    const images = this.getAllImages();
    delete images[recipeId];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images));
  }

  private getAllImages(): { [key: string]: string } {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  private saveToStorage(recipeId: string, imageData: string): void {
    const images = this.getAllImages();
    images[recipeId] = imageData;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images));
  }
}
