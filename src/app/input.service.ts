import { EventEmitter, TypedEventEmitter } from 'events';

import { GridCoordinates } from 'grid';

export class InputService {
  public onMove: TypedEventEmitter<GridCoordinates> = new TypedEventEmitter<GridCoordinates>();
  public onSpace: EventEmitter = new EventEmitter();

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
}
