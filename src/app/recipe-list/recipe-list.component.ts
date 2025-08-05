import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit {
  recipes = [
    {
      title: 'Борщ',
      date: new Date('2023-07-01'),
      imageUrl: 'https://via.placeholder.com/50'
    },
    {
      title: 'Пельмени',
      date: new Date('2023-07-02'),
      imageUrl: ''
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // В будущем здесь можно будет загрузить рецепты из Firebase
  }
}
