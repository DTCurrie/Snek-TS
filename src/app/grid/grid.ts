import { EntityType, Food } from 'entity';

import { GridCoordinates } from './grid-coordinates';
import { GridTile } from './grid-tile';

export class Grid {
  public tiles: Array<GridTile>;

  constructor(
    private canvas: HTMLCanvasElement,
    private ctx: CanvasRenderingContext2D,
    public width: number = 10,
    public height: number = 10,
    public tileSize: number = 12) {
    this.tiles = new Array<GridTile>();
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.tiles.push(new GridTile(new GridCoordinates(x, y), null));
      }
    }
  }

  private randomTile(): GridTile {
    const randomCoordinates = new GridCoordinates(Math.floor(Math.random() * 10), Math.floor(Math.random() * 10));
    let tile = this.getTileByCoordinates(randomCoordinates);

    if (tile.content) { tile = this.randomTile(); }
    return tile;
  }

  private getCoordinatePixel(coordinate: number): number {
    return coordinate * this.tileSize;
  }

  private drawTile(tile: GridTile): void {
    this.ctx.fillStyle = tile.content.color;
    this.ctx.fillRect(this.getCoordinatePixel(tile.coordinates.x), this.getCoordinatePixel(tile.coordinates.y), this.tileSize, this.tileSize);
  }

  public getTileByCoordinates(coordinates: GridCoordinates): GridTile {
    return this.tiles.find((tile: GridTile) => tile.coordinates.Equals(coordinates));
  }

  public getTileByContentType(contentType: EntityType): GridTile {
    return this.tiles.find((tile: GridTile) => tile.content && tile.content.type === contentType);
  }

  public generateFood(): void {
    const tile = this.randomTile();
    tile.content = new Food(tile.coordinates);
  }

  public drawGrid(): void {
    this.canvas.width = this.width * (this.tileSize);
    this.canvas.height = this.height * (this.tileSize);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const playerTile = this.getTileByContentType(EntityType.Player);
    if (playerTile) { this.drawTile(playerTile); }

    this.tiles.forEach((tile: GridTile) => {
      if (!tile.content) { return; }
      if (tile.content.type == EntityType.Segment || tile.content.type == EntityType.Food) { this.drawTile(tile); }
    });
  }
}
