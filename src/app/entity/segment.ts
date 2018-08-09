import { GridCoordinates } from 'grid';

import { Entity } from './entity.interface';
import { EntityType } from './entity-type.enum';

export class Segment implements Entity {
  public type: EntityType = EntityType.Segment;
  public color: string = "#666666";

  constructor(public coordinates: GridCoordinates = new GridCoordinates()) { }
}
