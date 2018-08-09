export class GridCoordinates {
  constructor(public x: number = 0, public y: number = 0) { }
  public Equals = (other: GridCoordinates): boolean => (this.x === other.x && this.y === other.y);
  public Add = (other: GridCoordinates): GridCoordinates => new GridCoordinates(this.x + other.x, this.y + other.y);
}
