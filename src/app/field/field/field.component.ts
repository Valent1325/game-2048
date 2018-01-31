import { Component, OnInit, HostListener, trigger, state, style, transition, animate, keyframes } from '@angular/core';
import { BehaviorSubject } from  'rxjs';
import { compile } from '../animations';


const size : number = 4;
const baseValue : number = 2;
export type FieldState = number [][];
export type Direction = 'top' | 'right' | 'down' | 'left';
export type AnimationState = Animation[][];
export type Animation = string;
export const AnimationDuration = 300;

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.css'],
  animations: [
     compile(size, AnimationDuration),
  ]
})
export class FieldComponent implements OnInit {

  tileWidth = 100;
  tileHeight = 100;
  private grid = new Array(size).fill(new Array(size).fill(null));

  private field: FieldState = new Array(size).fill(null).map(_ => new Array(size).fill(null));
  private fieldView : FieldState;
  private fieldMergeBlock: boolean[][];

  private animations: AnimationState;
  private animationsView: AnimationState;

  constructor() { }

  ngOnInit() {
    this.resetAnimations();
    this.createRandom();
    this.render(false);
  }

  // Обработка событий по стрелочкам
  @HostListener('document:keydown.ArrowUp') arrowUp(){
    this.moveTop();
  };

  @HostListener('document:keydown.ArrowRight') arrowRight(){
    this.moveRight();
  };

  @HostListener('document:keydown.ArrowDown') arrowDown(){
    this.moveDown();
  };

  @HostListener('document:keydown.ArrowLeft') arrowLeft(){
    this.moveLeft();
  };

  // Тестовая функция
  fill(x : number, y : number){
    this.field[x][y] = baseValue;
  }

  //Создание рандомного поля с цифрой
  createRandom(){
    let empties = [];
    let max = baseValue;
    this.field.forEach((row, rowIndex) => {
      row.forEach((tile,tileIndex) => {
        if(tile === null){
          empties.push([rowIndex, tileIndex]);
        } else if (tile > max){
          max = tile;
        }
      });
    });

    if(empties.length === 0){
      alert('Game over');
    }

    let value = baseValue;
    if (max > baseValue ** baseValue ){
      const end = max / baseValue ** baseValue;
       let current = baseValue;
       let stack = [];
       while (current <= end) {
         stack.push(current);
         current *= baseValue;
       }
       value = stack[Math.floor(Math.random() * stack.length)];
    }

    let coords = empties[Math.floor(Math.random()*empties.length)];
    this.field[coords[0]][coords[1]] = value;

  }

// Движение вврех
  moveTop(){
    // передвижение снизу вверх
    this.initMovement();
    let moved = false;
    for(let rowIndex = 0; rowIndex <= size - 1; rowIndex++){
    // передвижение слево направа
      for(let tileIndex = 0; tileIndex <= size - 1; tileIndex++){
        if(this.field[rowIndex][tileIndex] !== null){
          let searchIndex;
          for(searchIndex = rowIndex; searchIndex >= 0; searchIndex--){
            let mergeResult = this.mergeTiles(this.field, searchIndex, tileIndex, 'top');
            if (mergeResult !== false) {
              const diff = mergeResult === true ? rowIndex - searchIndex + 1 : rowIndex - searchIndex;
              if (diff !== 0) {
                moved = true;
                this.animations[rowIndex][tileIndex] = `moveTop-${diff}`;
              }
              break;
            }
          }
        }
      }
    }
    if (moved){
      this.createRandom();
      this.render();
    }
  }

// Движение вправо
  moveRight(){
  this.initMovement();
    let moved = false;
    for (let rowIndex = 0; rowIndex < size; rowIndex++) {
      for (let tileIndex = size - 1; tileIndex >= 0; tileIndex--) {
        if (this.field[rowIndex][tileIndex] !== null) {
          let searchIndex;
          for (searchIndex = tileIndex; searchIndex < size; searchIndex++) {
            let mergeResult = this.mergeTiles(this.field, rowIndex, searchIndex, 'right');
            if (mergeResult !== false) {
              const diff = mergeResult === true ? searchIndex - tileIndex + 1 : searchIndex - tileIndex;
              if (diff !== 0) {
                moved = true;
                this.animations[rowIndex][tileIndex] = `moveRight-${diff}`;
              }
              break;
            }
          }
        }
      }
    }
    if (moved) {
      this.createRandom();
      this.render();
    }
  }


  //Движение вниз
  moveDown(){
  this.initMovement();
    let moved = false;
    for (let rowIndex = size - 1; rowIndex >= 0; rowIndex--) {
      for (let tileIndex = 0; tileIndex < size; tileIndex++) {
        if (this.field[rowIndex][tileIndex] !== null) {
          let searchIndex;
          for (searchIndex = rowIndex; searchIndex < size; searchIndex++) {
            let mergeResult = this.mergeTiles(this.field, searchIndex, tileIndex, 'down');
            if (mergeResult !== false) {
              const diff = mergeResult === true ? searchIndex - rowIndex + 1 : searchIndex - rowIndex;
              if (diff !== 0) {
                moved = true;
                this.animations[rowIndex][tileIndex] = `moveDown-${diff}`;
              }
              break;
            }
          }
        }
      }
    }
    if (moved) {
      this.createRandom();
      this.render();
    }
}

  // Движение влево
  moveLeft(){
  this.initMovement();
  let moved = false;
  for (let rowIndex = 0; rowIndex < size; rowIndex++) {
    for (let tileIndex = 0; tileIndex < size; tileIndex++) {
      if (this.field[rowIndex][tileIndex] !== null) {
        let searchIndex;
        for (searchIndex = tileIndex; searchIndex >= 0; searchIndex--) {
          let mergeResult = this.mergeTiles(this.field, rowIndex, searchIndex, 'left');
          if (mergeResult !== false) {
            const diff = mergeResult === true ? tileIndex - searchIndex + 1 : tileIndex - searchIndex;
            if (diff !== 0) {
              moved = true;
              this.animations[rowIndex][tileIndex] = `moveLeft-${diff}`;
            }
            break;
          }
        }
      }
    }
  }
  if (moved) {
    this.createRandom();
    this.render();
  }
}

  // Функция проверки
  // Определяем в какую сторону двигаться, проверяем возможность сложения двух полей.
  private mergeTiles(field : FieldState, rowIndex : number, tileIndex : number, direction : Direction){

    const size = field.length;
    const tileValue = field[rowIndex][tileIndex];
    const destRowIndex = direction === 'top' ? rowIndex - 1 : direction === 'down' ? rowIndex + 1 : rowIndex;
    const destTileIndex = direction === 'left' ? tileIndex - 1 : direction === 'right' ? tileIndex + 1 : tileIndex;

    if(destRowIndex >= 0 && destRowIndex < size && destTileIndex >= 0 && destTileIndex < size){
      if(field[destRowIndex][destTileIndex] === null){
        field[destRowIndex][destTileIndex] = tileValue;
        field[rowIndex][tileIndex] = null;
        return false;
      } else if(field[destRowIndex][destTileIndex] === tileValue){
        field[destRowIndex][destTileIndex] *= 2;
        field[rowIndex][tileIndex] = null;
         this.fieldMergeBlock[destRowIndex][destTileIndex] = true;
        return true;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  //Сброс анимации
  resetAnimations(){
    this.animations = new Array(size).fill(null).map(_ => new Array(size).fill('base'));
  }


  //Инициализация движения
  private initMovement() {
    this.fieldMergeBlock = new Array(size).fill(false).map(_ => new Array(size).fill(false));
  }

  //Рендеринг анимации
  render(animate = true){
    if(animate){
      this.animationsView = this.clone(this.animations);
      setTimeout(() => {
        this.resetAnimations();
        this.animationsView = this.clone(this.animations);
        this.fieldView = this.clone(this.field);
      }, AnimationDuration);
    }else{
      this.animationsView = this.clone(this.animations);
      this.fieldView = this.clone(this.field);
    }
  }

  clone(state){
    let copy = [];
    state.forEach(row => {
      copy.push([...row]);
    });
    return copy;
  }


}
