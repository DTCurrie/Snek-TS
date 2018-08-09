import { GridCoordinates } from 'grid';

import { EntityType } from './entity-type.enum';

export interface Entity {
  type: EntityType;
  color: string;
  coordinates: GridCoordinates
}
