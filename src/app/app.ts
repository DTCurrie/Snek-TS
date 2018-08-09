import { EntityType, Player, Segment } from 'entity';
import { EventEmitter } from 'events';
import { Grid, GridCoordinates } from 'grid';
import { InputService } from 'input.service';
import { nativeWindow } from 'window';

/**
* The main app for the page.
* @export
*/
export class App {
  private input: InputService;
  private nextCoordinates: GridCoordinates;
  private moveCoordinates: GridCoordinates;

  private loop: number;

  private onScore: EventEmitter = new EventEmitter();

  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public scoreElement: HTMLElement;
  public grid: Grid;
  public player: Player;

  public score: number;
  public startInstructions = "PRESS SPACE TO START";
  public playInstructions = "USE THE ARROW KEYS";
  public gameOverInstructions = "PRESS SPACE TO RESTART";

  /** Creates and initializes a new instance of App on the Window */
  constructor() {
    nativeWindow().App = this;
    this.initialize();
  }

  private startGame(): void {
    this.input.onMove.once((coordinates: GridCoordinates) => {
      this.nextCoordinates = coordinates;
      this.moveCoordinates = this.nextCoordinates;
      this.startGameLoop();
      this.input.onMove.on((coordinates: GridCoordinates) => this.nextCoordinates = coordinates);
    });

    this.score = 0;
    this.scoreElement.textContent = `${this.score}`;

    this.grid = new Grid(this.canvas, this.ctx);
    this.player = new Player(new GridCoordinates(Math.floor(this.grid.width / 2), Math.floor(this.grid.width / 2)));
    this.grid.getTileByCoordinates(this.player.coordinates).content = this.player;
    this.grid.generateFood();
    this.grid.drawGrid();

    this.ctx.font = 'bold 10px Nokian';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = '#000000';
    this.ctx.fillText(this.playInstructions, this.canvas.width / 2, this.canvas.height / 2 + 25, this.canvas.width);
  }

  private newGame(): void {
    this.grid = new Grid(this.canvas, this.ctx);

    this.onScore.on(() => {
      this.score++;
      this.scoreElement.textContent = `${this.score}`;
    });

    this.input.onSpace.once(() => this.startGame());
    this.grid.drawGrid();
    this.ctx.font = 'bold 10px Nokian';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = '#000000';
    this.ctx.fillText(this.startInstructions, this.canvas.width / 2, this.canvas.height / 2, this.canvas.width);
  }

  private initialize(): void {
    this.input = new InputService();
    this.nextCoordinates = new GridCoordinates();
    this.moveCoordinates = this.nextCoordinates;

    this.canvas = <HTMLCanvasElement>document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.scoreElement = document.getElementById('score');

    this.newGame();
  }

  private checkMovement(): GridCoordinates {
    if (this.moveCoordinates.x > 0 && this.nextCoordinates.x < 0) { return this.moveCoordinates; }
    if (this.moveCoordinates.x < 0 && this.nextCoordinates.x > 0) { return this.moveCoordinates; }
    if (this.moveCoordinates.y > 0 && this.nextCoordinates.y < 0) { return this.moveCoordinates; }
    if (this.moveCoordinates.y < 0 && this.nextCoordinates.y > 0) { return this.moveCoordinates; }
    return this.nextCoordinates;
  }

  private calculateCollision(coordinates: GridCoordinates): EntityType | null {
    if (coordinates.x < 0 || coordinates.x > this.grid.width - 1) { return EntityType.Wall; }
    if (coordinates.y < 0 || coordinates.y > this.grid.height - 1) { return EntityType.Wall; }
    const other = this.grid.getTileByCoordinates(coordinates);
    if (!other.content) { return null; }
    return other.content.type;
  }

  private movePlayer(coordinates: GridCoordinates): void {
    const oldCoordinates = this.player.coordinates;
    this.grid.getTileByCoordinates(oldCoordinates).content = null;
    this.player.coordinates = coordinates;
    this.grid.getTileByCoordinates(this.player.coordinates).content = this.player;

    if (this.player.segmentCoordinates.length) {
      this.grid.getTileByCoordinates(this.player.segmentCoordinates.pop()).content = null;
      this.grid.getTileByCoordinates(oldCoordinates).content = new Segment(oldCoordinates);
      this.player.addSegment(oldCoordinates);
    }
  }

  private gameOver(): void {
    this.ctx.font = 'bold 20px Nokian';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.strokeStyle = '#000000';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.strokeText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2, this.canvas.width);

    this.ctx.font = 'bold 10px Nokian';
    this.ctx.fillStyle = '#000000';
    this.ctx.fillText(this.gameOverInstructions, this.canvas.width / 2, this.canvas.height / 2 + 25, this.canvas.width);

    clearInterval(this.loop);

    this.input.onMove.clear();
    this.input.onSpace.once(() => this.startGame());
  }

  private startGameLoop(): void {
    this.loop = setInterval(() => {
      this.moveCoordinates = this.checkMovement();
      const coordinates = this.player.coordinates.Add(this.moveCoordinates);
      const collision = this.calculateCollision(coordinates);

      if (!collision) { this.movePlayer(coordinates); }

      if (collision === EntityType.Food) {
        this.movePlayer(coordinates);
        this.player.addSegment(coordinates);
        this.grid.generateFood();
        this.onScore.emit();
      }

      if (collision === EntityType.Wall || collision === EntityType.Segment) {
        this.gameOver();
        return;
      }

      setTimeout(this.grid.drawGrid(), 0);
    }, 100);
  }
}
