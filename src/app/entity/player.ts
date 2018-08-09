import { GridCoordinates } from 'grid';

import { Entity } from './entity.interface';
import { EntityType } from './entity-type.enum';

export class Player implements Entity {
  public type: EntityType = EntityType.Player;
  public color: string = "#AAAAAA";

  public segmentCoordinates: Array<GridCoordinates>;

  constructor(public coordinates: GridCoordinates = new GridCoordinates()) {
    this.segmentCoordinates = new Array<GridCoordinates>();
  }

  public addSegment(coordinates: GridCoordinates) {
    this.segmentCoordinates.unshift(coordinates);
  }
}
