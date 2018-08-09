import { Entity } from 'entity';

import { GridCoordinates } from './grid-coordinates';

export class GridTile {
  constructor(public coordinates: GridCoordinates, public content: Entity = null) { }
}
