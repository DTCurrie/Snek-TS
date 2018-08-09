import { Emitter, TypedEmitter } from 'emitters';

import { GridCoordinates } from 'grid';

export class InputService {
  public onMove: TypedEmitter<GridCoordinates> = new TypedEmitter<GridCoordinates>();
  public onSpace: Emitter = new Emitter();

  constructor() { document.addEventListener('keydown', ($event: KeyboardEvent) => this.keyboardInput($event)); }

  private keyboardInput(event: KeyboardEvent) {
    if (event.keyCode === 38) { // up
      this.onMove.emit(new GridCoordinates(0, -1));
    } else if (event.keyCode === 40) { // down
      this.onMove.emit(new GridCoordinates(0, 1));
    } else if (event.keyCode === 37) { // left
      this.onMove.emit(new GridCoordinates(-1, 0));
    } else if (event.keyCode === 39) { // right
      this.onMove.emit(new GridCoordinates(1, 0));
    } else if (event.keyCode === 32) { // space
      this.onSpace.emit();
    }
  }

  public buttonInput(input: string) {
    if (input === 'up') {
      this.onMove.emit(new GridCoordinates(0, -1));
    } else if (input === "down") {
      this.onMove.emit(new GridCoordinates(0, 1));
    } else if (input === "left") {
      this.onMove.emit(new GridCoordinates(-1, 0));
    } else if (input === "right") {
      this.onMove.emit(new GridCoordinates(1, 0));
    } else if (input === "space") {
      this.onSpace.emit();
    }
  }
}
