import { GridCoordinates } from 'grid';

import { Entity } from './entity.interface';
import { EntityType } from './entity-type.enum';

export class Food implements Entity {
  public type: EntityType = EntityType.Food;
  public color: string = "#999999";

  constructor(public coordinates: GridCoordinates = new GridCoordinates()) { }
}
