import { Component, OnInit, HostListener, trigger, state, style, transition, animate, keyframes } from '@angular/core';
import { BehaviorSubject } from  'rxjs';


export type FieldState = number [][];

export type Direction = 'top' | 'right' | 'bottom' | 'left';

export type AnimationState = Animation[][];
export type Animation = 'base' | 'moveTop' | 'moveRight' | 'moveDown' | 'moveLeft';
export const AnimationDuration = 300;

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.css'],
  animations: [
    trigger('tile', [
      state('base', style({
        transform: 'translateX(0) scale(1)',
      })),
      state('updated',   style({})),
      state('moveLeft',   style({})),
      state('moveRight',   style({})),
      transition('base => updated', [
        animate(AnimationDuration, keyframes([
          style({transform: 'scale(1)', zIndex: 1, offset: 0}),
          style({transform: 'scale(1.1)', zIndex: 1, offset: 0.3}),
          style({transform: 'scale(1)', zIndex: 1, offset: 1.0})
        ]))
      ]),
      transition('base => moveLeft', [
        animate(AnimationDuration, keyframes([
          style({transform: 'translateX(0)', zIndex: 1, offset: 0}),
          style({transform: 'translateX(-100%)', zIndex: 1,  offset: 1}),
        ]))
      ]),
      transition('base => moveRight', [
        animate(AnimationDuration, keyframes([
          style({transform: 'translateX(0)', zIndex: 1, offset: 0}),
          style({transform: 'translateX(100%)', zIndex: 1,  offset: 1}),
        ]))
      ]),
      transition('base => moveTop', [
        animate(AnimationDuration, keyframes([
          style({transform: 'translateY(0)', zIndex: 1, offset: 0}),
          style({transform: 'translateY(-100%)', zIndex: 1,  offset: 1}),
        ]))
      ]),
      transition('base => moveDown', [
        animate(AnimationDuration, keyframes([
          style({transform: 'translateY(0)', zIndex: 1, offset: 0}),
          style({transform: 'translateY(100%)', zIndex: 1,  offset: 1}),
        ]))
      ]),
    ])
  ]
})
export class FieldComponent implements OnInit {

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

  private size : number = 4;
  private baseValue : number = 2;

  private grid = new Array(this.size).fill(new Array(this.size).fill(null));
  //private state$ = new BehaviorSubject<FieldState>(new Array(this.size).fill(null).map(_ => new Array(this.size).fill(null)));

  private field: FieldState = new Array(this.size).fill(null).map(_ => new Array(this.size).fill(null));
  private fieldView : FieldState;

  private animations: AnimationState;
  private animationsView: AnimationState;

  tileWidth = 100;
  tileHeight = 100;


  constructor() { }

  ngOnInit() {
    this.resetAnimations();
    this.createRandom();
    this.render(false);
  }

  fill(x : number, y : number){
    this.field[x][y] = this.baseValue;
    //let field = this.state$.value;
    //field[x][y] = this.baseValue;
  }

  createRandom(){
    //let field = this.state$.value;
    let empties = [];
    this.field.forEach((row, rowIndex) => {
      row.forEach((tile,tileIndex) => {
        if(tile === null){
          empties.push([rowIndex, tileIndex]);
        }
      })
    });

    if(empties.length === 0){
      alert('Game over');
    }

    let coords = empties[Math.floor(Math.random()*empties.length)];
    this.field[coords[0]][coords[1]] = this.baseValue;

    //this.state$.next(field);
  }

// Движение вврех
  moveTop(){
    //let field = this.state$.value;
    // move from bottom to top
    for(let rowIndex = 0; rowIndex <= this.size - 1; rowIndex++){
    // move from left to right
      for(let tileIndex = 0; tileIndex <= this.size - 1; tileIndex++){
        if(this.field[rowIndex][tileIndex] !== null){
        // move to top edge
          for(let searchIndex = rowIndex; searchIndex > 0; searchIndex--){
            if(this.mergeTiles(this.field, searchIndex, tileIndex, 'top')){
              if(searchIndex === tileIndex){
                this.animations[rowIndex][tileIndex] = 'moveTop';
              }
            } else {
              break;
            }
          }
        }
      }
    }
    this.createRandom();
    this.render();
  }

// Движение вправо
  moveRight(){
    //let field = this.state$.value;
    // move from top to bottom
    for(let rowIndex = 0; rowIndex <= this.size - 1; rowIndex++){
    // move from right to left
      for(let tileIndex = this.size - 1; tileIndex >= 0; tileIndex--){
        // check value & edge
        if(this.field[rowIndex][tileIndex] !== null){
        // move to right edge
          for(let searchIndex = tileIndex; searchIndex <= this.size - 1; searchIndex++){
            if(this.mergeTiles(this.field, rowIndex, searchIndex, 'right')){
              if(searchIndex === tileIndex){
                this.animations[rowIndex][tileIndex] = 'moveRight';
              }
            } else{
              break;
            }
          }
        }
      }
    }
    this.createRandom();
    this.render();
  }


  //Движение вниз
  moveDown(){
    //let field = this.state$.value;
    for(let rowIndex = this.size - 1; rowIndex >= 0; rowIndex--){
      for(let tileIndex = 0; tileIndex <= this.size - 1; tileIndex++){
        if(this.field[rowIndex][tileIndex] !== null){
          for(let searchIndex = rowIndex; searchIndex <= this.size - 1; searchIndex++){
            if(this.mergeTiles(this.field, searchIndex, tileIndex, 'bottom')){
              if(searchIndex === tileIndex){
                this.animations[rowIndex][tileIndex] = 'moveDown';
              }
            } else{
              break;
            }
          }
        }
      }
    }
    this.createRandom();
    this.render();
  }

  // Движение влево
  moveLeft(){
    //let field = this.state$.value;
    for(let rowIndex = 0; rowIndex <= this.size - 1; rowIndex++){
      for(let tileIndex = 0; tileIndex <= this.size - 1; tileIndex++){
        if(this.field[rowIndex][tileIndex] !== null){
          for(let searchIndex = tileIndex; searchIndex > 0; searchIndex--){
            if(this.mergeTiles(this.field, rowIndex, searchIndex, 'left')){
              if(searchIndex === tileIndex){
                this.animations[rowIndex][tileIndex] = 'moveLeft';
              }
            } else{
              break;
            }
          }
        }
      }
    }
    this.createRandom();
    this.render();
  }


  private mergeTiles(field : FieldState, rowIndex : number, tileIndex : number, direction : Direction){

    const size = field.length;
    const tileValue = field[rowIndex][tileIndex];
    const destRowIndex = direction === 'top' ? rowIndex - 1 : direction === 'bottom' ? rowIndex + 1 : rowIndex;
    const destTileIndex = direction === 'left' ? tileIndex - 1 : direction === 'right' ? tileIndex + 1 : tileIndex;

    if(destRowIndex >= 0 && destRowIndex < size && destTileIndex >= 0 && destTileIndex < size){
      if(field[destRowIndex][destTileIndex] === null){
        field[destRowIndex][destTileIndex] = tileValue;
        field[rowIndex][tileIndex] = null;
        return true;
      } else if(field[destRowIndex][destTileIndex] === tileValue){
        field[destRowIndex][destTileIndex] *= 2;
        field[rowIndex][tileIndex] = null;
        return false;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  resetAnimations(){
    this.animations = new Array(this.size).fill(null).map(_ => new Array(this.size).fill('base'));
  }

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
